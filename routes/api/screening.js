'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let screening = require('../../models/his/screening');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let screen = {};
  // console.log(memberId)  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      console.log(rows[0]);
      let hn = rows[0].patient_hn;
      if (rows) {
        screening.getFootHistory(dbHIS, hn)
          .then(rows => {
            console.log(rows[0][0]);
            screen.foot = rows[0][0];
            return screening.getEyeHistory(dbHIS, hn);
          })
          .then(rows => {
            screen.eye = rows[0][0];
            console.log(screen);
            let ciphertext = encrypt.encrypt(screen);
            res.send({ ok: true, data: ciphertext.toString() });
          })
          .catch(err => res.send({ ok: false, msg: err }));
      } else {
        res.send({ ok: false, msg: 'กรุณากำหนดผู้ป่วย เริ่มด้น' });
      }

    })
    .catch(err => res.send({ ok: false, msg: err }));
  
});

module.exports = router;