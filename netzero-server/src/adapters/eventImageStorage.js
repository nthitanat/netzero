const fs = require('fs/promises');
const path = require('path');
const config = require('../config/env');

const IMAGE_FILES = Object.freeze({
  poster: { directory: 'posterImage', prefix: 'poster' },
  thumbnail: { directory: 'thumbnail', prefix: 'thumbnail' }
});

async function findEventImage({ eventId, imageType }) {
  const image = IMAGE_FILES[imageType];
  if (!image) return null;
  const uploadRoot = path.isAbsolute(config.upload.dir)
    ? config.upload.dir
    : path.resolve(__dirname, '../../', config.upload.dir);
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

module.exports = { findEventImage };
