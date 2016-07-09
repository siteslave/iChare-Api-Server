'use strict';

module.exports = {
  doLogin(db, username, password) {
    return db('users')
      .count('* as total')
      .where({
        username: username,
        password: password
      });
  },

  changePassword(db, username, password) {
    return db('users')
      .where('username', username)
      .update({ password: password });
  }
};