const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'fpo_management2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initializeDatabase = async () => {
  try {
    // Create connection for initialization
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'fpo_management2'}`);
    await conn.query(`USE ${process.env.DB_NAME || 'fpo_management2'}`);
    
    // Create tables without foreign key constraints
    await conn.query(`
      CREATE TABLE IF NOT EXISTS fpo_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(15) NOT NULL UNIQUE,
        fpo_name VARCHAR(255) NOT NULL,
        legal_structure ENUM('Cooperative', 'Company', 'Society', 'Other') NOT NULL,
        incorporation_date DATE NOT NULL,
        password VARCHAR(255) NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        villages_covered TEXT,
        contact_name VARCHAR(255) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        alternate_contact VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        phone VARCHAR(15) PRIMARY KEY,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        phone VARCHAR(15) PRIMARY KEY,
        auth_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS productlistings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fpo_id INT NOT NULL,
        product VARCHAR(255) NOT NULL,
        variety VARCHAR(255),
        quantity DECIMAL(10,2) NOT NULL,
        grade VARCHAR(50),
        cost_per_quantity DECIMAL(10,2) NOT NULL,
        note TEXT,
        total DECIMAL(10,2),
        portal_charges_checked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS farmer_otp_store (
        phone VARCHAR(15) PRIMARY KEY,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS farmer_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables initialized');
    await conn.end();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase
};