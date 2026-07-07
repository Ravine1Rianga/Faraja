// ================================================================
//  FARAJA — Seed script: creates default admin user.
//  Usage: node seed.js
// ================================================================
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await conn.query('CREATE DATABASE IF NOT EXISTS faraja_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('USE faraja_db');

  // Ensure roles exist
  await conn.query(`INSERT IGNORE INTO roles (id, name) VALUES
    (1, 'admin'), (2, 'family'), (3, 'contributor'), (4, 'vendor'), (5, 'committee')`);

  // Create admin user
  const hash = await bcrypt.hash('admin123', 12);
  await conn.query(
    `INSERT IGNORE INTO users (role_id, name, email, password_hash) VALUES (1, 'Admin', 'admin@faraja.co.ke', ?)`,
    [hash]
  );

  console.log('✅ Seed complete — admin@faraja.co.ke / admin123');
  await conn.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
