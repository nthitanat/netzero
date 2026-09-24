const { pool } = require('../config/database');

const CHAT_APP_COLUMNS = `
  id, owner_id, product_id, title, description, status,
  isActive, createdAt, updatedAt
`;
const UPDATE_COLUMNS = Object.freeze({
  title: 'title',
  description: 'description',
  status: 'status'
});

function mapChatApp(row) {
  return {
    chatId: row.id,
    ownerId: row.owner_id,
    productId: row.product_id,
    title: row.title,
    description: row.description,
    status: row.status,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function findAll(filters = {}, { tx } = {}) {
  const database = tx || pool;
  let query = `SELECT ${CHAT_APP_COLUMNS} FROM chatApps WHERE isActive = TRUE`;
  const values = [];
  const columns = { ownerId: 'owner_id', productId: 'product_id', status: 'status' };
  for (const [name, column] of Object.entries(columns)) {
    if (filters[name] === undefined) continue;
    query += ` AND ${column} = ?`;
    values.push(filters[name]);
  }
  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  values.push(String(filters.limit), String(filters.offset));
  const [rows] = await database.execute(query, values);
  return rows.map(mapChatApp);
}

async function findById(chatId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${CHAT_APP_COLUMNS} FROM chatApps WHERE id = ? AND isActive = TRUE`,
    [chatId]
  );
  return rows[0] ? mapChatApp(rows[0]) : null;
}

async function insert(chatApp, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO chatApps (id, owner_id, product_id, title, description, status, isActive)
    VALUES (?, ?, ?, ?, ?, ?, TRUE)
  `, [
    chatApp.chatId, chatApp.ownerId, chatApp.productId,
    chatApp.title, chatApp.description ?? null, chatApp.status
  ]);
  return result.affectedRows > 0;
}

async function updateById({ chatId, ownerId, updates }, { tx } = {}) {
  const database = tx || pool;
  const fields = Object.entries(updates).filter(([name]) => UPDATE_COLUMNS[name]);
  if (fields.length === 0) return false;
  const assignments = fields.map(([name]) => `${UPDATE_COLUMNS[name]} = ?`).join(', ');
  const values = fields.map(([, value]) => value);
  const [result] = await database.execute(`
    UPDATE chatApps SET ${assignments}, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND owner_id = ? AND isActive = TRUE
  `, [...values, chatId, ownerId]);
  return result.affectedRows > 0;
}

async function deactivateById({ chatId, ownerId }, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    UPDATE chatApps SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND owner_id = ? AND isActive = TRUE
  `, [chatId, ownerId]);
  return result.affectedRows > 0;
}

async function getStatistics(ownerId, { tx } = {}) {
  const database = tx || pool;
  const values = ownerId === null ? [] : [ownerId];
  const scope = ownerId === null ? '' : ' AND owner_id = ?';
  const [rows] = await database.execute(`
    SELECT COUNT(*) AS totalChats,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeChats,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closedChats,
      SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archivedChats
    FROM chatApps WHERE isActive = TRUE${scope}
  `, values);
  const row = rows[0];
  return {
    totalChats: row.totalChats,
    activeChats: row.activeChats,
    closedChats: row.closedChats,
    archivedChats: row.archivedChats
  };
}

module.exports = { findAll, findById, insert, updateById, deactivateById, getStatistics };
