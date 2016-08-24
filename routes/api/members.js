'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../../configure/jwt');
let members = require('../../models/member');
let encrypt = require('../../models/encrypt');

router.post('/toggle-alert', (req, res, next) => {
  let db = req.db;
  let encryptedText = req.body.params;
  let memberId = req.body.memberId;
  
  members.getSessionKey(db, memberId)
    .then(rows => {
      let data = rows[0];
      let sessionKey = data.session_key;
      let decrypted = encrypt.decrypt(encryptedText, sessionKey);

      let params = JSON.parse(decrypted);
      let token = params.token;
      let type = params.type;
      let status = params.status;

      jwt.verify(token)
        .then(decoded => {
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
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => res.send({ ok: false, msg: err }));
    
});

router.post('/get-alert-setting', (req, res, next) => {
  let db = req.db;
  let encryptedText = req.body.params;
  let memberId = req.body.memberId;
  
  members.getSessionKey(db, memberId)
    .then(rows => {
      let data = rows[0];
      let sessionKey = data.session_key;
      let decrypted = encrypt.decrypt(encryptedText, sessionKey);

      let params = JSON.parse(decrypted);
      let token = params.token;
      let type = params.type;
      let status = params.status;

      jwt.verify(token)
        .then(decoded => {
          members.getAlertSetting(db, memberId)
            .then(rows => {
              let ciphertext = encrypt.encrypt(rows, sessionKey);
              res.send({ ok: true, data: ciphertext.toString() });
            })
            .catch(err => res.send({ ok: false, msg: err }));
          
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => res.send({ ok: false, msg: err }));
  
});

module.exports = router;