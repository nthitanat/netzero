const { pool } = require('../config/database');

const RESERVATION_COLUMNS = `
  pr.reservation_id, pr.user_id, pr.product_id, pr.event_id,
  pr.quantity, pr.reserved_unit_price, pr.note, pr.shipping_address,
  pr.option_of_delivery, pr.user_note, pr.seller_note, pr.pickup_date,
  pr.status, pr.created_at, pr.updated_at,
  p.title AS product_title, p.price AS product_price,
  p.type AS product_type, p.user_id AS product_owner_id,
  u.firstName AS customer_firstName, u.lastName AS customer_lastName,
  u.email AS customer_email, u.phoneNumber AS customer_phone,
  owner.firstName AS owner_firstName, owner.lastName AS owner_lastName,
  owner.email AS owner_email,
  e.title AS event_title, e.location AS event_location,
  e.event_date AS event_date
`;
const RESERVATION_JOINS = `
  FROM product_reservations pr
  LEFT JOIN products p ON pr.product_id = p.id
  LEFT JOIN users u ON pr.user_id = u.id
  LEFT JOIN users owner ON p.user_id = owner.id
  LEFT JOIN events e ON pr.event_id = e.id
`;
const UPDATE_COLUMNS = Object.freeze({
  quantity: 'quantity',
  note: 'note',
  shippingAddress: 'shipping_address',
  optionOfDelivery: 'option_of_delivery',
  userNote: 'user_note',
  sellerNote: 'seller_note',
  pickupDate: 'pickup_date'
});

function mapReservation(row) {
  return {
    reservationId: row.reservation_id,
    customerId: row.user_id,
    productId: row.product_id,
    eventId: row.event_id,
    quantity: row.quantity,
    reservedUnitPrice: row.reserved_unit_price,
    note: row.note,
    shippingAddress: row.shipping_address,
    optionOfDelivery: row.option_of_delivery,
    userNote: row.user_note,
    sellerNote: row.seller_note,
    pickupDate: row.pickup_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    product: {
      id: row.product_id,
      title: row.product_title,
      price: row.product_price,
      type: row.product_type,
      ownerId: row.product_owner_id
    },
    customer: {
      firstName: row.customer_firstName,
      lastName: row.customer_lastName,
      email: row.customer_email,
      phone: row.customer_phone
    },
    owner: {
      firstName: row.owner_firstName,
      lastName: row.owner_lastName,
      email: row.owner_email
    },
    event: row.event_id ? {
      id: row.event_id,
      title: row.event_title,
      location: row.event_location,
      eventDate: row.event_date
    } : null
  };
}

async function insert(reservation, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO product_reservations (
      user_id, product_id, event_id, quantity, reserved_unit_price,
      note, shipping_address, option_of_delivery, user_note, pickup_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    reservation.customerId, reservation.productId, reservation.eventId,
    reservation.quantity, reservation.reservedUnitPrice, reservation.note ?? null,
    reservation.shippingAddress ?? null, reservation.optionOfDelivery,
    reservation.userNote ?? null, reservation.pickupDate ?? null, reservation.status
  ]);
  return result.insertId;
}

async function findAll(filters = {}, { tx } = {}) {
  const database = tx || pool;
  let query = `SELECT ${RESERVATION_COLUMNS} ${RESERVATION_JOINS} WHERE 1 = 1`;
  const values = [];
  const filterColumns = {
    customerId: 'pr.user_id',
    productId: 'pr.product_id',
    ownerId: 'p.user_id',
    status: 'pr.status'
  };
  for (const [name, column] of Object.entries(filterColumns)) {
    if (filters[name] === undefined) continue;
    query += ` AND ${column} = ?`;
    values.push(filters[name]);
  }
  if (filters.visibleToActorId !== undefined) {
    query += ' AND (pr.user_id = ? OR p.user_id = ?)';
    values.push(filters.visibleToActorId, filters.visibleToActorId);
  }
  query += ' ORDER BY pr.created_at DESC';
  if (filters.limit !== undefined) {
    query += ' LIMIT ?';
    values.push(String(filters.limit));
    if (filters.offset !== undefined) {
      query += ' OFFSET ?';
      values.push(String(filters.offset));
    }
  }
  const [rows] = await database.execute(query, values);
  return rows.map(mapReservation);
}

async function findById(reservationId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${RESERVATION_COLUMNS} ${RESERVATION_JOINS} WHERE pr.reservation_id = ?`,
    [reservationId]
  );
  return rows[0] ? mapReservation(rows[0]) : null;
}

async function lockById(reservationId, { tx }) {
  const [rows] = await tx.execute(
    'SELECT reservation_id FROM product_reservations WHERE reservation_id = ? FOR UPDATE',
    [reservationId]
  );
  return rows.length > 0;
}

async function updateFields(reservationId, updates, { tx } = {}) {
  const database = tx || pool;
  const fields = Object.entries(updates).filter(([name]) => UPDATE_COLUMNS[name]);
  if (fields.length === 0) return false;
  const assignments = fields.map(([name]) => `${UPDATE_COLUMNS[name]} = ?`).join(', ');
  const values = fields.map(([, value]) => value);
  const [result] = await database.execute(
    `UPDATE product_reservations SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE reservation_id = ?`,
    [...values, reservationId]
  );
  return result.affectedRows > 0;
}

async function transitionPending(reservationId, status, { tx }) {
  const [result] = await tx.execute(
    `UPDATE product_reservations SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE reservation_id = ? AND status = 'pending'`,
    [status, reservationId]
  );
  return result.affectedRows > 0;
}

async function deleteById(reservationId, { tx }) {
  const [result] = await tx.execute(
    'DELETE FROM product_reservations WHERE reservation_id = ?',
    [reservationId]
  );
  return result.affectedRows > 0;
}

async function getOwnerStats(ownerId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT COUNT(*) AS total_reservations,
      SUM(CASE WHEN pr.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
      SUM(CASE WHEN pr.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_count,
      SUM(CASE WHEN pr.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
    FROM product_reservations pr
    JOIN products p ON pr.product_id = p.id
    WHERE p.user_id = ?
  `, [ownerId]);
  const row = rows[0];
  return {
    totalReservations: row.total_reservations,
    pendingCount: row.pending_count,
    confirmedCount: row.confirmed_count,
    cancelledCount: row.cancelled_count
  };
}

module.exports = {
  insert,
  findAll,
  findById,
  lockById,
  updateFields,
  transitionPending,
  deleteById,
  getOwnerStats
};
