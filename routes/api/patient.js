'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../../configure/jwt');
let members = require('../../models/member');
let patient = require('../../models/his/patient');
let encrypt = require('../../models/encrypt');

router.get('/members', (req, res, next) => {
  // console.log(req.params);
  // console.log(req.query);
  let dbHIS = req.dbHIS;
  let db = req.db;
  let token = req.query.token;

  let secretKey = jwt.getSecretKey();
  let decoded = req.decoded;
  // console.log(decoded);

  let memberId = decoded.memberId;
  let hns = [];
  let memberPatients = [];

  members.getPatientMemberList(db, memberId)
    .then(rows => {
      let ciphertext = encrypt.encrypt(rows);
      res.send({ ok: true, data: ciphertext.toString() });
    })
    .catch(err => res.send({ ok: false, msg: err }));

});

router.post('/set-default', (req, res, next) => {
  let db = req.db;

  let hn = req.body.hn;
  let decoded = req.decoded;
  let memberId = decoded.memberId;
  let encryptedText = req.body.params;

  console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  if (memberId && params.hn) {
    members.clearDefault(db, memberId)
      .then(() => {
        return members.setDefault(db, memberId, params.hn);
      })
      .then(() => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err }));
  }
});

router.post('/save-photo', (req, res, next) => {
  let db = req.db;
  let hn = req.body.hn;
  let image = req.body.image;

  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let encryptedText = req.body.params;

  // console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);
  
  members.savePhoto(db, memberId, params.hn, params.image)
    .then(() => res.send({ ok: true }))
    .catch(err => res.send({ ok: false, msg: err }));
});


module.exports = router;