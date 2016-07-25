'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let lab = require('../../models/his/lab');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let labs = {};
  
  // console.log(memberId)  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      console.log(rows[0]);
      let hn = rows[0].patient_hn;
      if (rows) {
        lab.getEGfr(dbHIS, hn)
          .then(rows => {
            console.log(rows[0]);
            labs.egfr = _.orderBy(rows[0], ['vstdate'], ['asc']);

            return lab.getFBS(dbHIS, hn);            
             
          })
          .then(rows => {
            labs.fbs = _.orderBy(rows[0], ['vstdate'], ['asc']);
            return lab.getHdl(dbHIS, hn);
          })
          .then(rows => {
            labs.hdl = _.orderBy(rows[0], ['vstdate'], ['asc']);
            return lab.getCreatinine(dbHIS, hn);
          })
          .then(rows => {
            labs.creatinine = _.orderBy(rows[0], ['vstdate'], ['asc']);
            return lab.getTc(dbHIS, hn);
          })
          .then(rows => {
            labs.tc = _.orderBy(rows[0], ['vstdate'], ['asc']);
            return lab.getHbA1c(dbHIS, hn);
          })
          .then(rows => {
            labs.hba1c = _.orderBy(rows[0], ['vstdate'], ['asc']);
            let ciphertext = encrypt.encrypt(labs);
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