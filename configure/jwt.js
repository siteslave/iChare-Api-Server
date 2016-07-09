'use strict'; 

let jwt = require('jsonwebtoken');

let secretKey = '9336bff7d152422e5ca53599bc129142';

module.exports = {

  getSecretKey() {
    return secretKey;
  },
  
  decode(token) {
    try {
      let decoded = jwt.verify(token, secretKey);
      return { ok: true, decoded: decoded };
    } catch (err) {
      return { ok: false, msg: err.message };
    }
    
  },

  sign(payload) {
    let token = jwt.sign(payload, secretKey, {
        expiresIn: "1d"
    });
    
    return token;
  }
}