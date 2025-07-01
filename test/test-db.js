import pool from './database/db.js';

async function test() {
  const [rows] = await pool.query('SELECT * FROM users LIMIT 5');
  console.log(rows);
}

test();
