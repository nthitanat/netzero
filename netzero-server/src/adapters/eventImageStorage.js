const fs = require('fs/promises');
const path = require('path');
const config = require('../config/env');

const IMAGE_FILES = Object.freeze({
  poster: { directory: 'posterImage', prefix: 'poster' },
  thumbnail: { directory: 'thumbnail', prefix: 'thumbnail' }
});

function getUploadRoot() {
  return path.isAbsolute(config.upload.dir)
    ? config.upload.dir
    : path.resolve(__dirname, '../../', config.upload.dir);
}

function resolveStoragePath(relativePath) {
  const root = path.resolve(getUploadRoot());
  const absolutePath = path.resolve(root, relativePath);
  if (!absolutePath.startsWith(`${root}${path.sep}`)) throw new Error('Invalid image storage path');
  return absolutePath;
}

async function findEventImage({ eventId, imageType }) {
  const image = IMAGE_FILES[imageType];
  if (!image) return null;
  const uploadRoot = getUploadRoot();
  const imagePath = path.resolve(
    uploadRoot,
    'events',
    image.directory,
    String(eventId),
    `${image.prefix}_${eventId}.png`
  );
  try {
    await fs.access(imagePath);
    return imagePath;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

module.exports = { findEventImage, getUploadRoot, resolveStoragePath };
