'use strict';

module.exports = {
  list(db) {
    return db('titles')
      .orderBy('name');
  }
};