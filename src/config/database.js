const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'fpo_management2',
  waitForConnections: true,
  connectionLimit: 40,
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
        email VARCHAR(255),
        legal_structure ENUM('Cooperative', 'Company', 'Society', 'Other') NOT NULL,
        whatsapp_enabled VARCHAR(10),
        incorporation_date DATE NOT NULL,
        password VARCHAR(255) NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        villages_covered TEXT,
        board_member_name VARCHAR(255),
        ceo_name VARCHAR(255),
        contact_name VARCHAR(255),
        designation VARCHAR(100),
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
      CREATE TABLE IF NOT EXISTS farmer_sessions2 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS farmers2 (
        farmer_id INT AUTO_INCREMENT PRIMARY KEY,
        fpo_id INT,
        farmer_name VARCHAR(255),
        contact_number VARCHAR(15),
        village_name VARCHAR(255),
        house_number VARCHAR(100),
        gram_panchayat VARCHAR(255),
        district_name VARCHAR(255),
        state_name VARCHAR(255),
        pincode VARCHAR(10),
        block VARCHAR(255),
        years_in_farming INT,
        years_in_growing_crop INT,
        total_plot_size DECIMAL(10,2),
        total_plot_unit VARCHAR(50),
        soil_testing_done VARCHAR(10),
        open_to_soil_testing VARCHAR(10),
        prone_to_calamities VARCHAR(10),
        calamity_type VARCHAR(255),
        impact_duration_days INT,
        impact_severity VARCHAR(50),
        willing_to_adopt_sustainable_farming VARCHAR(10),
        participates_in_govt_schemes VARCHAR(10),
        preferred_payment_method VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS farmer_crop_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        crop_variety VARCHAR(255),
        crop_sub_variety VARCHAR(255),
        grade VARCHAR(50),
        sowing_date DATE,
        farming_type VARCHAR(100),
        harvest_date DATE,
        expected_harvest_quantity DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrations: add missing columns to existing tables
    const alterStatements = [
      "ALTER TABLE fpo_details ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
      "ALTER TABLE fpo_details ADD COLUMN IF NOT EXISTS whatsapp_enabled VARCHAR(10)",
      "ALTER TABLE fpo_details ADD COLUMN IF NOT EXISTS board_member_name VARCHAR(255)",
      "ALTER TABLE fpo_details ADD COLUMN IF NOT EXISTS ceo_name VARCHAR(255)",
      "ALTER TABLE fpo_details MODIFY COLUMN contact_name VARCHAR(255) NULL",
      "ALTER TABLE fpo_details MODIFY COLUMN designation VARCHAR(100) NULL",
      "ALTER TABLE farmers2 ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'",
    ];
    for (const sql of alterStatements) {
      try {
        await conn.query(sql);
      } catch (e) {
        // Ignore errors (column may already exist on MySQL which doesn't support IF NOT EXISTS)
        if (!e.message.includes('Duplicate column')) {
          console.warn('Migration warning:', e.message);
        }
      }
    }

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