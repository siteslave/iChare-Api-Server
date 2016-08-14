'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let jwt = require('../../configure/jwt');

let router = express.Router();

let allergy = require('../../models/his/allergy');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/info', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let encryptedText = req.body.params;
  let memberId = req.body.memberId;

  // get sessionKey
  member.getSessionKey(db, memberId)
    .then(rows => {
      let data = rows[0];
      let sessionKey = data.session_key;

      let decrypted = encrypt.decrypt(encryptedText, sessionKey);
      let params = JSON.parse(decrypted);
      
      // console.log(params);

      let token = params.token;
  
      // console.log(token);

      jwt.verify(token)
        .then(decoded => {
          console.log(decoded);
          member.getDefaultPatient(db, memberId)
            .then(rows => {
              let hn = rows[0].patient_hn;
              if (rows) {
                allergy.getAllergy(dbHIS, hn)
                  .then(rows => {
                    let ciphertext = encrypt.encrypt(rows[0], sessionKey);
                    res.send({ ok: true, data: ciphertext.toString() });
                  })
                  .catch(err => res.send({ ok: false, msg: err }));
              } else {
                res.send({ ok: false, msg: 'กรุณากำหนดผู้ป่วย เริ่มด้น' });
              }

            })
            .catch(err => res.send({ ok: false, msg: err }));
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => {
      res.send({ ok: false, msg: err });
    });
});

module.exports = router;