'use strict'; 

let jwt = require('jsonwebtoken');


let secretKey = '5dbdd0dff1280f2c56a072ee10f2c8b34e9a4b2885008ff917d813b5a3c13bf7';


module.exports = {

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
  },

  verify(token) {
    
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
    
  }
};