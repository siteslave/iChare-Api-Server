'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../configure/jwt');
let members = require('../models/member');
let patient = require('../models/his/patient');
let encrypt = require('../models/encrypt');

router.post('/list', (req, res, next) => {
  let db = req.db;
  let dbHIS = req.dbHIS;
  let date = req.body.date;
  // get hns 
  members.getAllPatientsHn(db)
    .then(rows => {
      let hns = [];
      rows.forEach(v => {
        hns.push(v.patient_hn);
      });
      console.log(hns);
      // get service by date
      return patient.getVisitListByDate(dbHIS, hns, date);
    })
    .then(rows => res.send({ ok: true, rows: rows }))
    .catch(err => res.send({ ok: false, msg: err }));

});

router.post('/send', (req, res, next) => {
  let db = req.db;
  let dbHIS = req.dbHIS;
  let hns = req.body.hns;

  console.log(hns);
  // find device token
  members.getDeviceTokenAlertService(db, hns)
    .then(rows => {
      let token = [];
      rows.forEach(v => {
        token.push(v.device_token);
      });

      console.log(token);

      let gcm = require('node-gcm');

      let message = new gcm.Message();

      message.addData('title', 'แจ้งเตือนเข้ารับบริการ');
      message.addData('message', 'มีผู้ป่วยในความดูแลได้เข้ารับบริการที่โรงพยาบาล');
      message.addData('content-available', true);

      let regTokens = token;

      // Set up the sender with you API key
      let sender = new gcm.Sender('AIzaSyDr5KevzaUWybBXVBM2Exy0wJRp4a_2y8g');

      // Now the sender can be used to send messages
      sender.send(message, { registrationTokens: regTokens }, (err, response) => {
        if (err) {
          console.log(err);
          res.send({ ok: false, msg: err });
        } else {
          console.log(response);
          res.send({ ok: true });
        }
      });
    })
    .catch(err => res.send({ ok: false, msg: err })); 
});

module.exports = router;

