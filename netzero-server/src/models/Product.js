const { pool } = require('../config/database');

const PRODUCT_COLUMNS = `
  p.id, p.project_id, p.title, p.description, p.price, p.category,
  p.type, p.address, p.coordinate, p.stock_quantity,
  p.unassigned_stock_quantity, p.isRecommend, p.user_id,
  p.created_at, p.updated_at, u.firstName, u.lastName,
  u.email AS owner_email
`;
const PRODUCT_JOINS = 'FROM products p LEFT JOIN users u ON p.user_id = u.id';
const UPDATE_COLUMNS = Object.freeze({
  projectId: 'project_id',
  title: 'title',
  description: 'description',
  price: 'price',
  category: 'category',
  type: 'type',
  address: 'address',
  coordinate: 'coordinate',
  stockQuantity: 'stock_quantity',
  unassignedStockQuantity: 'unassigned_stock_quantity',
  isRecommended: 'isRecommend'
});

function mapProduct(row) {
  return {
    productId: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category,
    type: row.type,
    address: row.address,
    coordinate: row.coordinate,
    stockQuantity: row.stock_quantity,
    unassignedStockQuantity: row.unassigned_stock_quantity,
    isRecommended: Boolean(row.isRecommend),
    ownerId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    owner: {
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.owner_email
    }
  };
}

function buildProductFilters(filters) {
  let clause = ' WHERE 1 = 1';
  const values = [];
  const columns = {
    category: 'p.category',
    type: 'p.type',
    ownerId: 'p.user_id'
  };
  for (const [name, column] of Object.entries(columns)) {
    if (filters[name] === undefined) continue;
    clause += ` AND ${column} = ?`;
    values.push(filters[name]);
  }
  if (filters.isRecommended !== undefined) {
    clause += ' AND p.isRecommend = ?';
    values.push(filters.isRecommended ? 1 : 0);
  }
  if (filters.inStock) clause += ' AND p.stock_quantity > 0';
  if (filters.searchTerm !== undefined) {
    clause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    values.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
  }
  return { clause, values };
}

async function findAll(filters = {}, { tx } = {}) {
  const database = tx || pool;
  const { clause, values } = buildProductFilters(filters);
  const [rows] = await database.execute(`
    SELECT ${PRODUCT_COLUMNS} ${PRODUCT_JOINS} ${clause}
    ORDER BY p.created_at DESC LIMIT ? OFFSET ?
  `, [...values, String(filters.limit), String(filters.offset)]);
  return rows.map(mapProduct);
}

async function findById(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${PRODUCT_COLUMNS} ${PRODUCT_JOINS} WHERE p.id = ?
  `, [productId]);
  return rows[0] ? mapProduct(rows[0]) : null;
}

async function lockById(productId, { tx }) {
  const [rows] = await tx.execute('SELECT id FROM products WHERE id = ? FOR UPDATE', [productId]);
  return rows.length > 0;
}

async function insert(product, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO products (
      project_id, title, description, price, category, type,
      address, coordinate, stock_quantity, unassigned_stock_quantity,
      isRecommend, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    product.projectId ?? null,
    product.title,
    product.description,
    product.price,
    product.category,
    product.type,
    product.address ?? null,
    product.coordinate ?? null,
    product.stockQuantity ?? 0,
    product.stockQuantity ?? 0,
    product.isRecommended ? 1 : 0,
    product.ownerId
  ]);
  return result.insertId;
}

async function updateById({ productId, ownerId, updates }, { tx } = {}) {
  const database = tx || pool;
  const fields = Object.entries(updates).filter(([name]) => UPDATE_COLUMNS[name]);
  if (fields.length === 0) return false;
  const assignments = fields.map(([name]) => `${UPDATE_COLUMNS[name]} = ?`).join(', ');
  const values = fields.map(([name, value]) => name === 'isRecommended' ? (value ? 1 : 0) : value);
  const [result] = await database.execute(`
    UPDATE products SET ${assignments}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `, [...values, productId, ownerId]);
  return result.affectedRows > 0;
}

async function deleteById({ productId, ownerId }, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(
    'DELETE FROM products WHERE id = ? AND user_id = ?',
    [productId, ownerId]
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, lockById, insert, updateById, deleteById };
