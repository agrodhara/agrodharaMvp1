const { pool, initializeDatabase } = require('./database');
const { snsClient } = require('./aws');

module.exports = {
  db: {
    pool,
    initializeDatabase
  },
  aws: {
    snsClient
  }
};