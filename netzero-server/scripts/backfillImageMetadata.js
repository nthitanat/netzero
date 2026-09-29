#!/usr/bin/env node
// Run after applying sql/2026-09-25-image-metadata.sql and before nullable API responses.
// --audit only reports mismatches. --prune removes unreferenced files older than one day.
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { pool } = require('../src/config/database');
const config = require('../src/config/env');

const root = path.resolve(__dirname, '..', config.upload.dir);
const modes = new Set(process.argv.slice(2));
const auditOnly = modes.has('--audit') || modes.has('--prune');
const prune = modes.has('--prune');
const mime = { jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };

async function walk(directory) {
  let entries;
  try { entries = await fs.readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const paths = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(absolute));
    else if (entry.isFile()) paths.push(absolute);
  }
  return paths;
}

function relative(absolute) { return path.relative(root, absolute).split(path.sep).join('/'); }

async function imageRecord(absolute) {
  try {
    const [metadata, stats] = await Promise.all([sharp(absolute).metadata(), fs.stat(absolute)]);
    if (!mime[metadata.format]) throw new Error('unsupported format');
    return { relativePath: relative(absolute), mimetype: mime[metadata.format], size: stats.size,
      modified: stats.mtimeMs };
  } catch (error) {
    console.warn(`Unreadable image: ${relative(absolute)} (${error.message})`);
    return null;
  }
}

async function knownIds(table) {
  const [rows] = await pool.execute(`SELECT id FROM ${table}`);
  return new Set(rows.map(row => Number(row.id)));
}

async function backfillProducts() {
  const ids = await knownIds('products');
  const candidates = new Map();
  for (const absolute of await walk(path.join(root, 'products'))) {
    const file = relative(absolute);
    const match = file.match(/^products\/(thumbnail|cover|images)\/(\d+)\/(.+)$/);
    if (!match || !ids.has(Number(match[2]))) continue;
    const [, kind, idString, filename] = match;
    const id = Number(idString);
    const number = kind === 'images' ? Number(filename.match(/^image_(\d+)\.(?:jpg|png|gif|webp)$/)?.[1]) : null;
    if (kind === 'images' && !Number.isSafeInteger(number)) continue;
    if (kind !== 'images' && !new RegExp(`^${kind}_${id}\\.(?:jpg|png|gif|webp)$`).test(filename)) continue;
    const record = await imageRecord(absolute);
    if (!record) continue;
    const key = `${id}:${kind}:${number ?? ''}`;
    if (!candidates.has(key) || candidates.get(key).modified < record.modified) {
      candidates.set(key, { ...record, productId: id, role: kind === 'images' ? 'gallery' : kind,
        imageId: number });
    }
  }
  const byProduct = new Map();
  for (const record of candidates.values()) {
    if (!byProduct.has(record.productId)) byProduct.set(record.productId, []);
    byProduct.get(record.productId).push(record);
  }
  for (const [productId, records] of byProduct) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        'SELECT next_gallery_image_number FROM products WHERE id = ? FOR UPDATE', [productId]
      );
      if (!rows.length) { await connection.rollback(); continue; }
      for (const record of records) {
        await connection.execute(`
          INSERT IGNORE INTO product_images
            (product_id, role, image_number, display_position, relative_path, mime_type, size_bytes, file_modified_ms)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [productId, record.role, record.imageId,
          record.role === 'gallery' ? record.imageId : null,
          record.relativePath, record.mimetype, record.size, Math.round(record.modified)]);
      }
      const maximum = Math.max(0, ...records.filter(record => record.role === 'gallery').map(record => record.imageId));
      await connection.execute(`
        UPDATE products SET next_gallery_image_number = GREATEST(next_gallery_image_number, ?)
        WHERE id = ?
      `, [maximum + 1, productId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  }
  console.log(`Product legacy image candidates: ${candidates.size}`);
}

async function backfillEvents() {
  const ids = await knownIds('events');
  const candidates = new Map();
  for (const absolute of await walk(path.join(root, 'events'))) {
    const file = relative(absolute);
    const match = file.match(/^events\/(thumbnail|posterImage)\/(\d+)\/(thumbnail|poster)_(\d+)\.(?:jpg|png|gif|webp)$/);
    if (!match || Number(match[2]) !== Number(match[4]) || !ids.has(Number(match[2]))) continue;
    const role = match[1] === 'posterImage' ? 'poster' : 'thumbnail';
    if (role !== match[3]) continue;
    const record = await imageRecord(absolute);
    if (!record) continue;
    const key = `${match[2]}:${role}`;
    if (!candidates.has(key) || candidates.get(key).modified < record.modified) {
      candidates.set(key, { ...record, eventId: Number(match[2]), role });
    }
  }
  for (const record of candidates.values()) {
    await pool.execute(`
      INSERT INTO event_images
        (event_id, role, relative_path, mime_type, size_bytes, file_modified_ms)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        version = IF(relative_path <> VALUES(relative_path)
          OR mime_type <> VALUES(mime_type)
          OR size_bytes <> VALUES(size_bytes)
          OR file_modified_ms IS NULL
          OR file_modified_ms <> VALUES(file_modified_ms), version + 1, version),
        relative_path = VALUES(relative_path), mime_type = VALUES(mime_type),
        size_bytes = VALUES(size_bytes), file_modified_ms = VALUES(file_modified_ms)
    `, [record.eventId, record.role, record.relativePath, record.mimetype,
      record.size, Math.round(record.modified)]);
  }
  console.log(`Event legacy image candidates: ${candidates.size}`);
}

async function audit() {
  const [productRows] = await pool.execute('SELECT relative_path FROM product_images');
  const [eventRows] = await pool.execute('SELECT relative_path FROM event_images');
  const referenced = new Set([...productRows, ...eventRows].map(row => row.relative_path));
  let missing = 0;
  for (const file of referenced) {
    try { await fs.access(path.join(root, file)); }
    catch { console.warn(`Missing referenced file: ${file}`); missing += 1; }
  }
  let orphaned = 0;
  let removed = 0;
  for (const group of ['products', 'events']) {
    for (const absolute of await walk(path.join(root, group))) {
      const file = relative(absolute);
      if (referenced.has(file)) continue;
      orphaned += 1;
      console.warn(`Unreferenced file: ${file}`);
      if (prune && Date.now() - (await fs.stat(absolute)).mtimeMs > 24 * 60 * 60 * 1000) {
        await fs.unlink(absolute);
        removed += 1;
      }
    }
  }
  console.log(`Audit: ${referenced.size} rows, ${missing} missing files, ${orphaned} unreferenced files, ${removed} removed`);
  if (missing || orphaned > removed) process.exitCode = 1;
}

async function main() {
  try {
    if (!auditOnly) { await backfillProducts(); await backfillEvents(); }
    await audit();
  } finally { await pool.end(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
