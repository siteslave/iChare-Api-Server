'use strict';
let cryptojs = require('crypto-js');
let jwt = require('../configure/jwt');

let secretKey = jwt.getSecretKey();

module.exports = {
  decrypt(encryptKey) {
    let bytes = cryptojs.AES.decrypt(encryptKey.toString(), secretKey);
    let decrypt = bytes.toString(cryptojs.enc.Utf8);

    return decrypt;
  },

  encrypt(obj) {
    let encrypted = cryptojs.AES.encrypt(JSON.stringify(obj), secretKey);
    return encrypted.toString();
  }

};