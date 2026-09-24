const { pool } = require('../config/database');

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

async function findProductById(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT p.id, p.project_id, p.title, p.description, p.price, p.category,
      p.type, p.address, p.coordinate, p.stock_quantity,
      p.unassigned_stock_quantity, p.isRecommend, p.user_id,
      p.created_at, p.updated_at, u.firstName, u.lastName,
      u.email AS owner_email
    FROM products p LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `, [productId]);
  return rows[0] ? mapProduct(rows[0]) : null;
}

async function findEventStock({ eventId, productId }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT stock_quantity FROM event_products WHERE event_id = ? AND product_id = ?
     ${tx ? 'FOR UPDATE' : ''}`,
    [eventId, productId]
  );
  return rows[0] ? { stockQuantity: rows[0].stock_quantity } : null;
}

async function decrementProductStock({ productId, quantity, isEvent }, { tx }) {
  const query = isEvent
    ? `UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND stock_quantity >= ?`
    : `UPDATE products SET stock_quantity = stock_quantity - ?,
         unassigned_stock_quantity = unassigned_stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND stock_quantity >= ? AND unassigned_stock_quantity >= ?`;
  const values = isEvent
    ? [quantity, productId, quantity]
    : [quantity, quantity, productId, quantity, quantity];
  const [result] = await tx.execute(query, values);
  return result.affectedRows > 0;
}

async function decrementEventStock({ eventId, productId, quantity }, { tx }) {
  const [result] = await tx.execute(`
    UPDATE event_products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
    WHERE event_id = ? AND product_id = ? AND stock_quantity >= ?
  `, [quantity, eventId, productId, quantity]);
  return result.affectedRows > 0;
}

module.exports = {
  findProductById,
  findEventStock,
  decrementProductStock,
  decrementEventStock
};
