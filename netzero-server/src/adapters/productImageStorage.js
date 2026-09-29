const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const config = require('../config/env');

const IMAGE_KINDS = Object.freeze({
  thumbnail: { directory: 'thumbnail', prefix: 'thumbnail' },
  cover: { directory: 'cover', prefix: 'cover' },
  images: { directory: 'images', prefix: 'image' }
});
const IMAGE_FORMATS = Object.freeze({
  jpeg: { extension: 'jpg', mimetype: 'image/jpeg' },
  png: { extension: 'png', mimetype: 'image/png' },
  gif: { extension: 'gif', mimetype: 'image/gif' },
  webp: { extension: 'webp', mimetype: 'image/webp' }
});
const IMAGE_FILE_PATTERN = /^image_(\d+)\.(jpg|png|gif|webp)$/;
const MAX_IMAGE_PIXELS = 40_000_000;

function getUploadRoot() {
  return path.isAbsolute(config.upload.dir)
    ? config.upload.dir
    : path.resolve(__dirname, '../../', config.upload.dir);
}

function imageDirectory(productId, imageKind) {
  return path.join(getUploadRoot(), 'products', IMAGE_KINDS[imageKind].directory, String(productId));
}

function imagePath({ productId, imageKind, imageId, extension }) {
  const kind = IMAGE_KINDS[imageKind];
  if (!kind) return null;
  const filename = imageKind === 'images'
    ? `image_${imageId}.${extension}`
    : `${kind.prefix}_${productId}.${extension}`;
  return path.join(imageDirectory(productId, imageKind), filename);
}

async function findImage({ productId, imageKind, imageId }) {
  if (!IMAGE_KINDS[imageKind]) return null;
  const directory = imageDirectory(productId, imageKind);
  const prefix = imageKind === 'images' ? `image_${imageId}.` : `${IMAGE_KINDS[imageKind].prefix}_${productId}.`;
  let filenames;
  try {
    filenames = await fs.readdir(directory);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  const candidates = filenames.filter(filename => filename.startsWith(prefix) &&
    Object.values(IMAGE_FORMATS).some(format => filename === `${prefix}${format.extension}`));
  if (!candidates.length) return null;
  const files = await Promise.all(candidates.map(async filename => ({
    filename,
    stats: await fs.stat(path.join(directory, filename))
  })));
  files.sort((left, right) => right.stats.mtimeMs - left.stats.mtimeMs);
  const filename = files[0].filename;
  const filePath = path.join(directory, filename);
  try {
    // Old uploads may have JPEG bytes in a .png file. Detect their real type on read.
    const metadata = await sharp(filePath).metadata();
    const format = IMAGE_FORMATS[metadata.format];
    return format ? { filePath, mimetype: format.mimetype } : null;
  } catch {
    return null;
  }
}

async function listImages(productId) {
  const directory = imageDirectory(productId, 'images');
  let filenames;
  try {
    filenames = await fs.readdir(directory);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const images = await Promise.all(filenames.filter(filename => IMAGE_FILE_PATTERN.test(filename)).map(async filename => {
    const imageId = Number(filename.match(IMAGE_FILE_PATTERN)[1]);
    const stats = await fs.stat(path.join(directory, filename));
    return { imageId, filename, size: stats.size, exists: true, lastModified: stats.mtime };
  }));
  const byId = new Map();
  for (const image of images) {
    if (!byId.has(image.imageId) || image.lastModified > byId.get(image.imageId).lastModified) {
      byId.set(image.imageId, image);
    }
  }
  return [...byId.values()].sort((left, right) => left.imageId - right.imageId);
}

function getRelativePath(filePath) {
  return path.relative(getUploadRoot(), filePath).split(path.sep).join('/');
}

async function prepareImage(file) {
  let validatedPath;
  try {
    const metadata = await sharp(file.path, { animated: true, limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
    const format = IMAGE_FORMATS[metadata.format];
    if (!format) throw new Error('Unsupported image format');
    validatedPath = `${file.path}.validated-${crypto.randomUUID()}.${format.extension}`;
    await sharp(file.path, { animated: true, limitInputPixels: MAX_IMAGE_PIXELS })
      .toFormat(metadata.format)
      .toFile(validatedPath);
    const stats = await fs.stat(validatedPath);
    if (stats.size > config.upload.maxSize) throw new Error('Processed image exceeds upload size limit');
    return { validatedPath, format, size: stats.size, fileModifiedMs: Math.round(stats.mtimeMs) };
  } catch (error) {
    if (validatedPath) await fs.unlink(validatedPath).catch(() => {});
    if (['ENOSPC', 'EACCES', 'EROFS', 'EMFILE'].includes(error.code)) throw error;
    const invalidImage = new Error('Invalid or unsupported image file');
    invalidImage.code = 'INVALID_IMAGE';
    throw invalidImage;
  }
}

async function commitUpload({ file, productId, imageKind, imageId }) {
  const { validatedPath, format, size, fileModifiedMs } = await prepareImage(file);
  let destination;
  try {
    await fs.mkdir(imageDirectory(productId, imageKind), { recursive: true });
    await fs.unlink(file.path);
    const prefix = imageKind === 'images' ? `image_${imageId}` : `${IMAGE_KINDS[imageKind].prefix}_${productId}`;
    destination = path.join(imageDirectory(productId, imageKind),
      `${prefix}_${crypto.randomUUID()}.${format.extension}`);
    await fs.rename(validatedPath, destination);
    return {
      filename: path.basename(destination),
      relativePath: `files/${getRelativePath(destination)}`,
      storagePath: getRelativePath(destination),
      size,
      fileModifiedMs,
      mimetype: format.mimetype,
      ...(imageId !== undefined && { index: imageId })
    };
  } catch (error) {
    if (destination) await fs.unlink(destination).catch(() => {});
    throw error;
  } finally {
    await fs.unlink(validatedPath).catch(() => {});
  }
}

function resolveStoragePath(relativePath) {
  const root = path.resolve(getUploadRoot());
  const absolutePath = path.resolve(root, relativePath);
  if (!absolutePath.startsWith(`${root}${path.sep}`)) throw new Error('Invalid image storage path');
  return absolutePath;
}

async function discardStoredImage(relativePath) {
  try {
    await fs.unlink(resolveStoragePath(relativePath));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function discardUploads(files) {
  await Promise.all(files.map(async file => {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }));
}

module.exports = { findImage, listImages, commitUpload, discardUploads, discardStoredImage, resolveStoragePath,
  getUploadRoot };
