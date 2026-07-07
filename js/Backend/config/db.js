require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'faraja',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: function (field, next) {
    if (field.type === 'DATE') {
      return field.string();
    }
    return next();
  },
});

async function query(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return [result];
}

async function getConnection() {
  return pool.getConnection();
}

pool.getConnection()
  .then(c => { console.log('✅ MySQL connected'); c.release(); })
  .catch(err => { console.error('❌ MySQL connection failed:', err.message); process.exit(1); });

module.exports = { query, pool, getConnection };
