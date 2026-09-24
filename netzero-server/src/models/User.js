const { pool } = require('../config/database');

const PUBLIC_USER_COLUMNS = `
  id, email, firstName, lastName, role, profileImage, phoneNumber,
  address, isActive, emailVerified, lastLogin, createdAt, updatedAt
`;
const UPDATE_COLUMNS = Object.freeze({
  firstName: 'firstName',
  lastName: 'lastName',
  profileImage: 'profileImage',
  phoneNumber: 'phoneNumber',
  address: 'address'
});

function mapUser(row) {
  return {
    userId: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    profileImage: row.profileImage,
    phoneNumber: row.phoneNumber,
    address: row.address,
    isActive: Boolean(row.isActive),
    emailVerified: Boolean(row.emailVerified),
    lastLogin: row.lastLogin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.password !== undefined && { passwordHash: row.password })
  };
}

async function insert(user, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO users (email, password, firstName, lastName, role,
      profileImage, phoneNumber, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    user.email,
    user.passwordHash,
    user.firstName,
    user.lastName,
    user.role,
    user.profileImage ?? null,
    user.phoneNumber ?? null,
    user.address ?? null
  ]);
  return result.insertId;
}

async function findByEmail(email, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${PUBLIC_USER_COLUMNS}, password FROM users
    WHERE email = ? AND isActive = TRUE
  `, [email]);
  return rows[0] ? mapUser(rows[0]) : null;
}

async function findById(userId, { includePassword = false, tx } = {}) {
  const database = tx || pool;
  const passwordColumn = includePassword ? ', password' : '';
  const [rows] = await database.execute(`
    SELECT ${PUBLIC_USER_COLUMNS}${passwordColumn} FROM users
    WHERE id = ? AND isActive = TRUE
  `, [userId]);
  return rows[0] ? mapUser(rows[0]) : null;
}

async function updateById(userId, updates, { tx } = {}) {
  const database = tx || pool;
  const fields = Object.entries(updates).filter(([name]) => UPDATE_COLUMNS[name]);
  if (fields.length === 0) return false;
  const assignments = fields.map(([name]) => `${UPDATE_COLUMNS[name]} = ?`).join(', ');
  const values = fields.map(([, value]) => value);
  const [result] = await database.execute(`
    UPDATE users SET ${assignments}, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND isActive = TRUE
  `, [...values, userId]);
  return result.affectedRows > 0;
}

async function updatePasswordHash(userId, passwordHash, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND isActive = TRUE
  `, [passwordHash, userId]);
  return result.affectedRows > 0;
}

async function updateLastLogin(userId, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    UPDATE users SET lastLogin = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND isActive = TRUE
  `, [userId]);
  return result.affectedRows > 0;
}

async function deactivate(userId, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    UPDATE users SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND isActive = TRUE
  `, [userId]);
  return result.affectedRows > 0;
}

async function emailExists(email, excludeUserId = null, { tx } = {}) {
  const database = tx || pool;
  const query = excludeUserId === null
    ? 'SELECT id FROM users WHERE email = ? AND isActive = TRUE LIMIT 1'
    : 'SELECT id FROM users WHERE email = ? AND id <> ? AND isActive = TRUE LIMIT 1';
  const values = excludeUserId === null ? [email] : [email, excludeUserId];
  const [rows] = await database.execute(query, values);
  return rows.length > 0;
}

async function findAll({ limit, offset }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE isActive = TRUE
    ORDER BY createdAt DESC LIMIT ? OFFSET ?
  `, [String(limit), String(offset)]);
  return rows.map(mapUser);
}

async function countActive({ tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    'SELECT COUNT(*) AS count FROM users WHERE isActive = TRUE'
  );
  return rows[0].count;
}

module.exports = {
  insert,
  findByEmail,
  findById,
  updateById,
  updatePasswordHash,
  updateLastLogin,
  deactivate,
  emailExists,
  findAll,
  countActive
};
