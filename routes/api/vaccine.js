'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();
let jwt = require('../../configure/jwt');
let vaccine = require('../../models/his/vaccine');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let encryptedText = req.body.params;
  let memberId = req.body.memberId;
  
  member.getSessionKey(db, memberId)
    .then(rows => {
      let data = rows[0];
      let sessionKey = data.session_key;
      let decrypted = encrypt.decrypt(encryptedText, sessionKey);

      let params = JSON.parse(decrypted);
      let token = params.token;

      jwt.verify(token)
        .then(decoded => {
          member.getDefaultPatient(db, memberId)
            .then(rows => {
              let hn = rows[0].patient_hn;
              if (rows) {
                vaccine.getHistory(dbHIS, hn)
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
    }, err => res.send({ ok: false, msg: err }));

});

module.exports = router;