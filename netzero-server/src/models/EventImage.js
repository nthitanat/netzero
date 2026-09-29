const { pool } = require('../config/database');

function mapImage(row) {
  return { eventId: row.event_id, role: row.role, relativePath: row.relative_path,
    mimetype: row.mime_type, version: row.version, size: row.size_bytes,
    fileModifiedMs: row.file_modified_ms };
}

async function findForEvents(eventIds, { tx } = {}) {
  if (!eventIds.length) return [];
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT event_id, role, relative_path, mime_type, version, size_bytes, file_modified_ms FROM event_images
    WHERE event_id IN (${eventIds.map(() => '?').join(', ')})
  `, eventIds);
  return rows.map(mapImage);
}

async function findOne({ eventId, role }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT event_id, role, relative_path, mime_type, version, size_bytes, file_modified_ms FROM event_images
    WHERE event_id = ? AND role = ? LIMIT 1
  `, [eventId, role]);
  return rows[0] ? mapImage(rows[0]) : null;
}

async function upsert(image, { tx }) {
  await tx.execute(`
    INSERT INTO event_images (event_id, role, relative_path, mime_type, size_bytes, file_modified_ms)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE relative_path = VALUES(relative_path),
      mime_type = VALUES(mime_type), size_bytes = VALUES(size_bytes),
      file_modified_ms = VALUES(file_modified_ms), version = version + 1
  `, [image.eventId, image.role, image.relativePath, image.mimetype, image.size,
    image.fileModifiedMs ?? Date.now()]);
}

module.exports = { findForEvents, findOne, upsert };
