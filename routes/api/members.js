'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let members = require('../../models/member');
let encrypt = require('../../models/encrypt');

router.post('/register/device', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;
  let deviceToken = decoded.deviceToken;

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  members.saveDeviceToken(db, memberId, params.deviceToken)
    .then(() => {
      res.send({ ok: true });
    })
    .catch(err => {
      console.log(err);
      res.send({ ok: false, msg: err })
    });
  
});

router.post('/toggle-alert', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let type = req.body.type;
  let status = req.body.status;
  // type : 1 = news, 2 = appoint, 3 = service
  if (type == '1') {
    members.toggleAlertNews(db, memberId, status)
      .then(() => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err }));
  } else if (type == '2') {
    members.toggleAlertAppoint(db, memberId, status)
      .then(() => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err }));
  } else if (type == '3') {
    members.toggleAlertService(db, memberId, status)
      .then(() => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err }));
  } else {
    res.send({ ok: false, msg: 'กรุณาระบุประเภทที่ต้องการอัปเดท' });
  }
  
});

router.post('/get-alert-setting', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  members.getAlertSetting(db, memberId)
    .then(rows => res.send({ ok: true, alert: rows[0] }))
    .catch(err => res.send({ ok: false, msg: err }));
  
});

module.exports = router;