const fs = require('fs/promises');
const { constants: fsConstants } = require('fs');
const path = require('path');
const config = require('../config/env');

const IMAGE_KINDS = Object.freeze({
  thumbnail: { directory: 'thumbnail', prefix: 'thumbnail' },
  cover: { directory: 'cover', prefix: 'cover' },
  images: { directory: 'images', prefix: 'image' }
});
const IMAGE_FILE_PATTERN = /^image_(\d+)\.png$/;

function getUploadRoot() {
  return path.isAbsolute(config.upload.dir)
    ? config.upload.dir
    : path.resolve(__dirname, '../../', config.upload.dir);
}

function imagePath({ productId, imageKind, imageId }) {
  const kind = IMAGE_KINDS[imageKind];
  if (!kind) return null;
  const filename = imageKind === 'images'
    ? `image_${imageId}.png`
    : `${kind.prefix}_${productId}.png`;
  return path.join(getUploadRoot(), 'products', kind.directory, String(productId), filename);
}

async function findImage({ productId, imageKind, imageId }) {
  const filePath = imagePath({ productId, imageKind, imageId });
  if (!filePath) return null;
  try {
    await fs.access(filePath);
    return filePath;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function listImages(productId) {
  const directory = path.join(getUploadRoot(), 'products', 'images', String(productId));
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
  return images.sort((left, right) => left.imageId - right.imageId);
}

function getRelativePath(filePath) {
  return path.relative(getUploadRoot(), filePath).split(path.sep).join('/');
}

async function commitUpload({ file, productId, imageKind, imageId }) {
  let committedImageId = imageId;
  let destination = imagePath({ productId, imageKind, imageId: committedImageId });
  await fs.mkdir(path.dirname(destination), { recursive: true });
  if (imageKind === 'images') {
    while (true) {
      try {
        await fs.copyFile(file.path, destination, fsConstants.COPYFILE_EXCL);
        break;
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        committedImageId += 1;
        destination = imagePath({ productId, imageKind, imageId: committedImageId });
      }
    }
    try {
      await fs.unlink(file.path);
    } catch (error) {
      await fs.unlink(destination).catch(() => {});
      throw error;
    }
  } else {
    await fs.rename(file.path, destination);
  }
  return {
    filename: path.basename(destination),
    relativePath: `files/${getRelativePath(destination)}`,
    size: file.size,
    mimetype: file.mimetype,
    ...(committedImageId !== undefined && { index: committedImageId })
  };
}

async function discardCommittedImage({ productId, imageId }) {
  const filePath = imagePath({ productId, imageKind: 'images', imageId });
  try {
    await fs.unlink(filePath);
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

module.exports = { findImage, listImages, commitUpload, discardUploads, discardCommittedImage };
