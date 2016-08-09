'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');
let moment = require('moment');

let router = express.Router();

let appointment = require('../../models/his/appointment');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/list', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;
  
  // console.log(memberId)  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      let hn = rows[0].patient_hn;
      if (rows) {
        appointment.apiGetAppointment(dbHIS, hn)
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

router.post('/lastvisit', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  // let encryptedText = req.body.params;

  // // console.log(encryptedText);

  // let decrypted = encrypt.decrypt(encryptedText);
  // let params = JSON.parse(decrypted);
  // console.log(params);
  // console.log(memberId)  
  // get default hn
  member.getPatientsHn(db, memberId)
    .then(rows => {
      let hns = [];
      _.forEach(rows, v => {
        hns.push(v.patient_hn);
      });

      console.log(hns);
      let start = moment().subtract(3, 'months').format('YYYY-MM-DD');
      let end = moment().format('YYYY-MM-DD');

      console.log(start);
      console.log(end);

      return appointment.apiGetLastVisit(dbHIS, hns, start, end);
    })
    .then(rows => {
      let ciphertext = encrypt.encrypt(rows);
      res.send({ ok: true, data: ciphertext.toString() });
    })
    .catch(err => res.send({ ok: false, msg: err }));

});

router.post('/detail', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let encryptedText = req.body.params;

  // // console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);
  console.log(params);
  // console.log(memberId)  
  // get default hn
  appointment.apiGetAppointmentDetail(dbHIS, params.id)
    .then(rows => {
      let ciphertext = encrypt.encrypt(rows[0][0]);
      res.send({ ok: true, data: ciphertext.toString() });
    })
    .catch(err => res.send({ ok: false, msg: err }));

});

module.exports = router;