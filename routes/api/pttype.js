'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let pttype = require('../../models/his/pttype');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/get-pttype', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;
  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      let pttypes = {};

      let hn = rows[0].patient_hn;
      if (rows) {
        pttype.getCurrentPttype(dbHIS, hn)
          .then(rows => {
            pttypes.current = rows[0][0];
            return pttype.getHistory(dbHIS, hn);
          })
          .then(rows => {
            pttypes.history = rows[0];
            let ciphertext = encrypt.encrypt(pttypes);
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