'use strict';

module.exports = {

  getDatabaseConnection() {
    let db = require('knex')({
      client: 'mysql',
      connection: {
        host: 'localhost',
        port: 3306,
        database: 'ichare',
        user: 'root',
        password: '',
        charset: 'utf8'
      }
    });

    return db;

  },

  getHISConnection() {
    let db = require('knex')({
      client: 'mysql',
      connection: {
        host: 'localhost',
        port: 3306,
        database: 'hos',
        user: 'root',
        password: '',
        charset: 'utf8'
      }
    });

    return db;
  }
}