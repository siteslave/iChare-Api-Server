'use strict';
let cryptojs = require('crypto-js');

let masterKey = 'd59c2916461236846d375108a07e2fb6ede2800c39fe0e325286282186aa5c42';

module.exports = {
  getMasterKey() {
    return masterKey;
  },
  decrypt(encryptKey, key) {
    let bytes = cryptojs.AES.decrypt(encryptKey.toString(), key);
    let decrypt = bytes.toString(cryptojs.enc.Utf8);

    return decrypt;
  },

  encrypt(obj, key) {
    let encrypted = cryptojs.AES.encrypt(JSON.stringify(obj), key);
    return encrypted.toString();
  }

};