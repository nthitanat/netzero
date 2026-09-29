const { pool } = require('../config/database');

function mapImage(row) {
  return {
    productId: row.product_id,
    role: row.role,
    imageId: row.image_number,
    displayPosition: row.display_position,
    relativePath: row.relative_path,
    mimetype: row.mime_type,
    version: row.version,
    size: row.size_bytes,
    lastModified: row.file_modified_ms == null
      ? row.updated_at : new Date(Number(row.file_modified_ms))
  };
}

async function findForProducts(productIds, { tx } = {}) {
  if (!productIds.length) return [];
  const database = tx || pool;
  const placeholders = productIds.map(() => '?').join(', ');
  const [rows] = await database.execute(`
    SELECT product_id, role, image_number, display_position, relative_path, mime_type, version, size_bytes, file_modified_ms, updated_at
    FROM product_images WHERE product_id IN (${placeholders})
    ORDER BY product_id, role, display_position, image_number
  `, productIds);
  return rows.map(mapImage);
}

async function findOne({ productId, role, imageId }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT product_id, role, image_number, display_position, relative_path, mime_type, version, size_bytes, file_modified_ms, updated_at
    FROM product_images WHERE product_id = ? AND role = ?
      AND (role <> 'gallery' OR image_number = ?)
    LIMIT 1
  `, [productId, role, imageId ?? null]);
  return rows[0] ? mapImage(rows[0]) : null;
}

async function listGallery(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT product_id, role, image_number, display_position, relative_path, mime_type, version, size_bytes, file_modified_ms, updated_at
    FROM product_images WHERE product_id = ? AND role = 'gallery'
    ORDER BY display_position, image_number
  `, [productId]);
  return rows.map(mapImage);
}

async function reserveGalleryNumbers(productId, count, { tx }) {
  const [rows] = await tx.execute(
    'SELECT next_gallery_image_number FROM products WHERE id = ? FOR UPDATE', [productId]
  );
  if (!rows.length) return null;
  const start = rows[0].next_gallery_image_number;
  if (!Number.isSafeInteger(start + count - 1) || start + count - 1 > 4294967295) {
    throw new Error('Gallery image number exhausted');
  }
  await tx.execute('UPDATE products SET next_gallery_image_number = ? WHERE id = ?', [start + count, productId]);
  return Array.from({ length: count }, (_, index) => start + index);
}

async function insertGallery(images, { tx }) {
  for (const image of images) {
    await tx.execute(`
      INSERT INTO product_images
        (product_id, role, image_number, display_position, relative_path, mime_type, size_bytes, file_modified_ms)
      VALUES (?, 'gallery', ?, ?, ?, ?, ?, ?)
    `, [image.productId, image.imageId, image.displayPosition, image.relativePath,
      image.mimetype, image.size, image.fileModifiedMs ?? Date.now()]);
  }
}

async function replaceFixed(image, { tx }) {
  const [rows] = await tx.execute(`
    SELECT relative_path FROM product_images
    WHERE product_id = ? AND role = ? FOR UPDATE
  `, [image.productId, image.role]);
  await tx.execute(`
    INSERT INTO product_images (product_id, role, relative_path, mime_type, size_bytes, file_modified_ms)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE relative_path = VALUES(relative_path),
      mime_type = VALUES(mime_type), size_bytes = VALUES(size_bytes),
      file_modified_ms = VALUES(file_modified_ms), version = version + 1
  `, [image.productId, image.role, image.relativePath, image.mimetype, image.size,
    image.fileModifiedMs ?? Date.now()]);
  return rows[0]?.relative_path ?? null;
}

module.exports = { findForProducts, findOne, listGallery, reserveGalleryNumbers, insertGallery, replaceFixed };
