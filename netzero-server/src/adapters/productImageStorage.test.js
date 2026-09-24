const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const config = require('../config/env');
const imageStorage = require('./productImageStorage');

let uploadRoot;
let originalUploadDir;

beforeEach(async () => {
  originalUploadDir = config.upload.dir;
  uploadRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'netzero-image-test-'));
  config.upload.dir = uploadRoot;
});

afterEach(async () => {
  config.upload.dir = originalUploadDir;
  await fs.rm(uploadRoot, { recursive: true, force: true });
});

test('image upload reserves the next filename without replacing an existing image', async () => {
  const imageDirectory = path.join(uploadRoot, 'products', 'images', '2');
  await fs.mkdir(imageDirectory, { recursive: true });
  await fs.writeFile(path.join(imageDirectory, 'image_1.png'), 'existing');
  const stagedPath = path.join(uploadRoot, 'staged.png');
  await fs.writeFile(stagedPath, 'new');

  const uploaded = await imageStorage.commitUpload({
    file: { path: stagedPath, size: 3, mimetype: 'image/png' },
    productId: 2,
    imageKind: 'images',
    imageId: 1
  });

  expect(uploaded.index).toBe(2);
  expect(await fs.readFile(path.join(imageDirectory, 'image_1.png'), 'utf8')).toBe('existing');
  expect(await fs.readFile(path.join(imageDirectory, 'image_2.png'), 'utf8')).toBe('new');
  await imageStorage.discardCommittedImage({ productId: 2, imageId: 2 });
  await expect(fs.access(path.join(imageDirectory, 'image_2.png'))).rejects.toMatchObject({ code: 'ENOENT' });
});
