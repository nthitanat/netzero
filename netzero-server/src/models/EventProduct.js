const { pool } = require('../config/database');

const EVENT_PRODUCT_COLUMNS = `
  ep.id, ep.event_id, ep.product_id, ep.event_price, ep.stock_quantity,
  ep.status, ep.created_at, ep.updated_at,
  e.title AS event_title, e.event_date, e.location AS event_location,
  p.title AS product_title, p.stock_quantity AS product_stock_quantity,
  p.unassigned_stock_quantity AS product_unassigned_stock_quantity
`;
const EVENT_PRODUCT_JOINS = `
  FROM event_products ep
  LEFT JOIN events e ON ep.event_id = e.id
  LEFT JOIN products p ON ep.product_id = p.id
`;

function mapEventProduct(row) {
  return {
    eventProductId: row.id,
    eventId: row.event_id,
    productId: row.product_id,
    eventPrice: row.event_price,
    stockQuantity: row.stock_quantity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    eventTitle: row.event_title,
    eventDate: row.event_date,
    eventLocation: row.event_location,
    productTitle: row.product_title,
    productStockQuantity: row.product_stock_quantity,
    productUnassignedStockQuantity: row.product_unassigned_stock_quantity
  };
}

async function findById(eventProductId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${EVENT_PRODUCT_COLUMNS} ${EVENT_PRODUCT_JOINS} WHERE ep.id = ?`,
    [eventProductId]
  );
  return rows[0] ? mapEventProduct(rows[0]) : null;
}

async function lockById(eventProductId, { tx }) {
  const [rows] = await tx.execute(
    'SELECT id FROM event_products WHERE id = ? FOR UPDATE',
    [eventProductId]
  );
  return rows.length > 0;
}

async function findByEventAndProduct({ eventId, productId }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${EVENT_PRODUCT_COLUMNS} ${EVENT_PRODUCT_JOINS}
     WHERE ep.event_id = ? AND ep.product_id = ?`,
    [eventId, productId]
  );
  return rows[0] ? mapEventProduct(rows[0]) : null;
}

async function findAll(filters = {}, { tx } = {}) {
  const database = tx || pool;
  let query = `SELECT ${EVENT_PRODUCT_COLUMNS} ${EVENT_PRODUCT_JOINS} WHERE 1 = 1`;
  const values = [];
  const filterColumns = {
    eventId: 'ep.event_id',
    productId: 'ep.product_id',
    status: 'ep.status'
  };
  for (const [name, column] of Object.entries(filterColumns)) {
    if (filters[name] === undefined) continue;
    query += ` AND ${column} = ?`;
    values.push(filters[name]);
  }
  query += ' ORDER BY ep.created_at DESC LIMIT ? OFFSET ?';
  values.push(String(filters.limit), String(filters.offset));
  const [rows] = await database.execute(query, values);
  return rows.map(mapEventProduct);
}

async function getEventsByProductId(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT e.id AS event_id, e.title AS event_title, e.event_date,
      e.location, e.status, ep.event_price, ep.stock_quantity,
      ep.status AS event_product_status, ep.id AS event_product_id
    FROM event_products ep JOIN events e ON ep.event_id = e.id
    WHERE ep.product_id = ? ORDER BY e.event_date ASC
  `, [productId]);
  return rows.map(row => ({
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventDate: row.event_date,
    location: row.location,
    status: row.status,
    eventPrice: row.event_price,
    stockQuantity: row.stock_quantity,
    eventProductStatus: row.event_product_status,
    eventProductId: row.event_product_id
  }));
}

async function getProductsByEventId(eventId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT p.id AS product_id, p.title AS product_title, p.description,
      p.category, p.price AS original_price, ep.event_price,
      ep.stock_quantity, ep.status AS event_product_status,
      ep.id AS event_product_id
    FROM event_products ep JOIN products p ON ep.product_id = p.id
    WHERE ep.event_id = ? ORDER BY ep.created_at DESC
  `, [eventId]);
  return rows.map(row => ({
    productId: row.product_id,
    productTitle: row.product_title,
    description: row.description,
    category: row.category,
    originalPrice: row.original_price,
    eventPrice: row.event_price,
    stockQuantity: row.stock_quantity,
    eventProductStatus: row.event_product_status,
    eventProductId: row.event_product_id
  }));
}

async function insert(eventProduct, { tx }) {
  const [result] = await tx.execute(`
    INSERT INTO event_products (event_id, product_id, event_price, stock_quantity, status)
    VALUES (?, ?, ?, ?, ?)
  `, [
    eventProduct.eventId,
    eventProduct.productId,
    eventProduct.eventPrice,
    eventProduct.stockQuantity,
    eventProduct.status
  ]);
  return result.insertId;
}

async function updateById(eventProductId, updates, { tx }) {
  const [result] = await tx.execute(`
    UPDATE event_products SET event_price = ?, stock_quantity = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `, [updates.eventPrice, updates.stockQuantity, updates.status, eventProductId]);
  return result.affectedRows > 0;
}

async function deleteById(eventProductId, { tx }) {
  const [result] = await tx.execute('DELETE FROM event_products WHERE id = ?', [eventProductId]);
  return result.affectedRows > 0;
}

async function adjustUnassignedStock({ productId, quantityChange }, { tx }) {
  const [result] = await tx.execute(`
    UPDATE products SET unassigned_stock_quantity = unassigned_stock_quantity + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND unassigned_stock_quantity + ? >= 0
  `, [quantityChange, productId, quantityChange]);
  return result.affectedRows > 0;
}

async function countPendingReservations({ eventId, productId }, { tx }) {
  const [rows] = await tx.execute(`
    SELECT COUNT(*) AS reservation_count FROM product_reservations
    WHERE event_id = ? AND product_id = ? AND status = 'pending'
  `, [eventId, productId]);
  return rows[0].reservation_count;
}

async function findEventById(eventId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute('SELECT id, title FROM events WHERE id = ?', [eventId]);
  return rows[0] ? { eventId: rows[0].id, title: rows[0].title } : null;
}

module.exports = {
  findById,
  lockById,
  findByEventAndProduct,
  findAll,
  getEventsByProductId,
  getProductsByEventId,
  insert,
  updateById,
  deleteById,
  adjustUnassignedStock,
  countPendingReservations,
  findEventById
};
