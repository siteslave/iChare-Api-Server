'use strict';

module.exports = {

  getDatabaseConnection() {
    
    let db = require('knex')({
      client: 'mysql',
      connection: {
        host: process.env.ICHARE_DB_HOST,
        port: process.env.ICHARE_DB_PORT,
        database: process.env.ICHARE_DB_NAME,
        user: process.env.ICHARE_DB_USER,
        password: process.env.ICHARE_DB_PASSWORD,
        charset: 'utf8'
      }
    });

    return db;

  },

  getHISConnection() {
    let db = require('knex')({
      client: 'mysql',
      connection: {
        host: process.env.HIS_DB_HOST,
        port: process.env.HIS_DB_PORT,
        database: process.env.HIS_DB_NAME,
        user: process.env.HIS_DB_USER,
        password: process.env.HIS_DB_PASSWORD,
      }
    });

    return db;
  }
}