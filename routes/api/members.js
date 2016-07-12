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

module.exports = router;