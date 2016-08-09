'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let allergy = require('../../models/his/allergy');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/info', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;
  
  // let encryptedText = req.body.params;
  // let decrypted = encrypt.decrypt(encryptedText);
  // let params = JSON.parse(decrypted);

  // let hn = params.hn;

  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      let hn = rows[0].patient_hn;
      if (rows) {
        allergy.getAllergy(dbHIS, hn)
          .then(rows => {
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

module.exports = router;