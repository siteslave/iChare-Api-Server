'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../../configure/jwt');
let screening = require('../../models/his/screening');
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
          let screen = {};
          member.getDefaultPatient(db, memberId)
            .then(rows => {
              let hn = rows[0].patient_hn;
              if (rows) {
                screening.getFootHistory(dbHIS, hn)
                  .then(rows => {
                    screen.foot = rows[0][0];
                    return screening.getEyeHistory(dbHIS, hn);
                  })
                  .then(rows => {
                    screen.eye = rows[0][0];
                    let ciphertext = encrypt.encrypt(screen, sessionKey);
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