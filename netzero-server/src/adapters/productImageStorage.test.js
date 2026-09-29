const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
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

test('gallery upload writes the number reserved by the database without replacing a legacy image', async () => {
  const imageDirectory = path.join(uploadRoot, 'products', 'images', '2');
  await fs.mkdir(imageDirectory, { recursive: true });
  await fs.writeFile(path.join(imageDirectory, 'image_1.png'), 'existing');
  const stagedPath = path.join(uploadRoot, 'staged.upload');
  await fs.writeFile(stagedPath, await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).jpeg().toBuffer());

  const uploaded = await imageStorage.commitUpload({
    file: { path: stagedPath, mimetype: 'image/png' },
    productId: 2,
    imageKind: 'images',
    imageId: 2
  });

  expect(uploaded.index).toBe(2);
  expect(await fs.readFile(path.join(imageDirectory, 'image_1.png'), 'utf8')).toBe('existing');
  expect(uploaded.filename).toMatch(/^image_2_[\w-]+\.jpg$/);
  expect(uploaded.mimetype).toBe('image/jpeg');
  expect((await sharp(path.join(imageDirectory, uploaded.filename)).metadata()).format).toBe('jpeg');
  await imageStorage.discardStoredImage(uploaded.storagePath);
  await expect(fs.access(path.join(imageDirectory, uploaded.filename))).rejects.toMatchObject({ code: 'ENOENT' });
});

test('a JPG replaces an old PNG thumbnail and is fetched with its actual type', async () => {
  const directory = path.join(uploadRoot, 'products', 'thumbnail', '2');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'thumbnail_2.png'), 'old');
  const stagedPath = path.join(uploadRoot, 'staged.jpg');
  await fs.writeFile(stagedPath, await sharp({ create: { width: 2, height: 2, channels: 3, background: 'blue' } }).jpeg().toBuffer());

  const uploaded = await imageStorage.commitUpload({
    file: { path: stagedPath, mimetype: 'image/jpeg' }, productId: 2, imageKind: 'thumbnail'
  });

  expect(uploaded.filename).toMatch(/^thumbnail_2_[\w-]+\.jpg$/);
  expect((await sharp(path.join(directory, uploaded.filename)).metadata()).format).toBe('jpeg');
  // The service removes this only after its metadata transaction commits.
  expect(await fs.readFile(path.join(directory, 'thumbnail_2.png'), 'utf8')).toBe('old');
});

test('invalid image bytes are rejected before they become public', async () => {
  const stagedPath = path.join(uploadRoot, 'fake.upload');
  await fs.writeFile(stagedPath, 'not an image');
  await expect(imageStorage.commitUpload({
    file: { path: stagedPath, mimetype: 'image/jpeg' }, productId: 2, imageKind: 'cover'
  })).rejects.toMatchObject({ code: 'INVALID_IMAGE' });
  expect(await imageStorage.findImage({ productId: 2, imageKind: 'cover' })).toBeNull();
});

test('a legacy .png file containing JPEG bytes is served as JPEG', async () => {
  const directory = path.join(uploadRoot, 'products', 'cover', '2');
  await fs.mkdir(directory, { recursive: true });
  const legacyPath = path.join(directory, 'cover_2.png');
  await fs.writeFile(legacyPath, await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).jpeg().toBuffer());
  expect(await imageStorage.findImage({ productId: 2, imageKind: 'cover' })).toEqual({
    filePath: legacyPath, mimetype: 'image/jpeg'
  });
});

test('concurrent writes with reserved numbers retain both gallery files', async () => {
  const jpegPath = path.join(uploadRoot, 'first.jpg');
  const pngPath = path.join(uploadRoot, 'second.png');
  const image = sharp({ create: { width: 2, height: 2, channels: 3, background: 'green' } });
  await fs.writeFile(jpegPath, await image.clone().jpeg().toBuffer());
  await fs.writeFile(pngPath, await image.clone().png().toBuffer());

  const uploaded = await Promise.all([
    imageStorage.commitUpload({ file: { path: jpegPath }, productId: 2, imageKind: 'images', imageId: 1 }),
    imageStorage.commitUpload({ file: { path: pngPath }, productId: 2, imageKind: 'images', imageId: 2 })
  ]);

  expect(uploaded.map(file => file.index).sort()).toEqual([1, 2]);
  for (const file of uploaded) {
    await expect(fs.access(path.join(uploadRoot, file.storagePath))).resolves.toBeUndefined();
  }
});

test.each([
  ['gif', 'image/gif'],
  ['webp', 'image/webp']
])('%s uploads retain their actual format', async (format, mimetype) => {
  const stagedPath = path.join(uploadRoot, `staged.${format}`);
  await fs.writeFile(stagedPath, await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).toFormat(format).toBuffer());
  const uploaded = await imageStorage.commitUpload({
    file: { path: stagedPath }, productId: 2, imageKind: 'cover'
  });
  expect(uploaded.mimetype).toBe(mimetype);
  expect(uploaded.filename).toMatch(new RegExp(`^cover_2_[\\w-]+\\.${format}$`));
  expect((await sharp(path.join(uploadRoot, 'products', 'cover', '2', uploaded.filename)).metadata()).format).toBe(format);
});
