'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let ipd = require('../../models/his/ipd');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  // console.log(memberId)  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      console.log(rows[0]);
      let hn = rows[0].patient_hn;
      if (rows) {
        ipd.getHistory(dbHIS, hn)
          .then(rows => {
            console.log(rows[0]);
             let ciphertext = encrypt.encrypt(rows[0]);
             res.send({ ok: true, data: ciphertext.toString() });
          })
          .catch(err => res.send({ ok: false, msg: err }));
      } else {
        res.send({ ok: false, msg: 'กรุณากำหนดผู้ป่วย เริ่มด้น' });
      }

    })
    .catch(err => res.send({ ok: false, msg: err }));
  
});

router.post('/detail', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let encryptedText = req.body.params;

  console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);
  let an = params.an;
  console.log(an);
  
  let details = {};

  ipd.getDetail(dbHIS, an)
    .then(rows => {
      details.register = rows[0][0];
      return ipd.getDrugToHome(dbHIS, an)
    })
    .then(rows => {
      details.drugHome = rows[0];
      console.log(details);

      let ciphertext = encrypt.encrypt(details);
      res.send({ ok: true, data: ciphertext.toString() });
    })
    .catch(err => res.send({ ok: false, msg: err }));
  
  
});

module.exports = router;