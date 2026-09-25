const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let dbType = 'postgres';
let pgPool = null;
// let sqliteDb = null;

// Ensure data folder exists for SQLite fallback or data storage
// const dataDir = path.join(__dirname, '..', 'data');
// if (!fs.existsSync(dataDir)) {
//   fs.mkdirSync(dataDir, { recursive: true });
// }

async function initializeDatabase() {
  // First attempt PostgreSQL connection
  try {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    await client.query('SELECT 1;');
    client.release();

    pgPool = pool;
    dbType = 'postgres';
    console.log('✅ [Database] Connected successfully to PostgreSQL (Host: ' + (process.env.DB_HOST || 'localhost') + ')');
    await runPostgresMigrations();
    return;
  } catch (pgError) {
    console.warn('[Database] PostgreSQL connection failed (' + pgError.message + ').');
    // console.warn('[Database] Falling back to embedded SQLite storage for seamless out-of-the-box operation.');

    // Fallback to SQLite
    // const Database = require('better-sqlite3');
    // const sqlitePath = path.join(dataDir, 'thingspulse.sqlite');
    // sqliteDb = new Database(sqlitePath);
    // sqliteDb.pragma('journal_mode = WAL');
    // dbType = 'sqlite';
    // console.log('✅ [Database] Initialized SQLite database at ' + sqlitePath);
    // runSqliteMigrations();
  }
}

async function runPostgresMigrations() {
  const schema = `
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(100),
      company VARCHAR(255),
      status VARCHAR(50) DEFAULT 'PENDING_INVITE',
      invite_token VARCHAR(255),
      invite_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS devices (
      id VARCHAR(64) PRIMARY KEY,
      unique_id VARCHAR(100) UNIQUE NOT NULL,
      serial_number VARCHAR(100) UNIQUE NOT NULL,
      model VARCHAR(100) NOT NULL,
      firmware_version VARCHAR(50) NOT NULL,
      mfg_date VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'AVAILABLE',
      customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
      assigned_at TIMESTAMP,
      credentials_token VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS telemetry_readings (
      id VARCHAR(64) PRIMARY KEY,
      device_id VARCHAR(64) NOT NULL,
      metric VARCHAR(100) NOT NULL,
      value NUMERIC NOT NULL,
      unit VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_email VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100),
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pgPool.query(schema);
  console.log('✅ [Database] PostgreSQL tables verified and updated.');
}

// function runSqliteMigrations() {
//   const schema = `
//     CREATE TABLE IF NOT EXISTS customers (
//       id TEXT PRIMARY KEY,
//       name TEXT NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       phone TEXT,
//       company TEXT,
//       status TEXT DEFAULT 'PENDING_INVITE',
//       invite_token TEXT,
//       invite_expires_at TEXT,
//       created_at TEXT DEFAULT (datetime('now'))
//     );

//     CREATE TABLE IF NOT EXISTS users (
//       id TEXT PRIMARY KEY,
//       email TEXT UNIQUE NOT NULL,
//       password_hash TEXT NOT NULL,
//       name TEXT NOT NULL,
//       role TEXT NOT NULL,
//       customer_id TEXT,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
//     );

//     CREATE TABLE IF NOT EXISTS devices (
//       id TEXT PRIMARY KEY,
//       unique_id TEXT UNIQUE NOT NULL,
//       serial_number TEXT UNIQUE NOT NULL,
//       model TEXT NOT NULL,
//       firmware_version TEXT NOT NULL,
//       mfg_date TEXT NOT NULL,
//       status TEXT DEFAULT 'AVAILABLE',
//       customer_id TEXT,
//       assigned_at TEXT,
//       credentials_token TEXT NOT NULL,
//       created_at TEXT DEFAULT (datetime('now')),
//       FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
//     );

//     CREATE TABLE IF NOT EXISTS telemetry_readings (
//       id TEXT PRIMARY KEY,
//       device_id TEXT NOT NULL,
//       metric TEXT NOT NULL,
//       value REAL NOT NULL,
//       unit TEXT NOT NULL,
//       timestamp TEXT DEFAULT (datetime('now'))
//     );

//     CREATE TABLE IF NOT EXISTS audit_logs (
//       id TEXT PRIMARY KEY,
//       user_email TEXT,
//       action TEXT NOT NULL,
//       entity_type TEXT NOT NULL,
//       entity_id TEXT,
//       details TEXT,
//       created_at TEXT DEFAULT (datetime('now'))
//     );
//   `;
//   sqliteDb.exec(schema);
//   console.log('✅ [Database] SQLite tables verified and ready.');
// }

// Unified query wrapper
// async function query(sqlText, params = []) {
//   if (dbType === 'postgres') {
//     const result = await pgPool.query(sqlText, params);
//     return {
//       rows: result.rows,
//       rowCount: result.rowCount
//     };
//   } else {
//     // SQLite parameter conversion: map $1, $2 to ? with precise index resolution
//     const convertedParams = [];
//     let sqliteSql = sqlText.replace(/\$(\d+)/g, (match, p1) => {
//       const idx = parseInt(p1, 10) - 1;
//       convertedParams.push(params[idx]);
//       return '?';
//     });

//     // Handle ILIKE for SQLite
//     sqliteSql = sqliteSql.replace(/ILIKE/gi, 'LIKE');

//     const trimmed = sqliteSql.trim().toUpperCase();
//     if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
//       const stmt = sqliteDb.prepare(sqliteSql);
//       const rows = stmt.all(...convertedParams);
//       return { rows, rowCount: rows.length };
//     } else {
//       const stmt = sqliteDb.prepare(sqliteSql);
//       const info = stmt.run(...convertedParams);
//       return {
//         rows: [],
//         rowCount: info.changes,
//         lastInsertRowid: info.lastInsertRowid
//       };
//     }
//   }
// }

// function getDatabaseStatus() {
//   return {
//     type: dbType,
//     connected: true,
//     engine: dbType === 'postgres' ? 'PostgreSQL 18' : 'SQLite (Active Fallback)',
//     host: dbType === 'postgres' ? (process.env.DB_HOST || 'localhost') : 'Embedded Local Storage'
//   };
// }

module.exports = {
  initializeDatabase,
  // query,
  // getDatabaseStatus
};
