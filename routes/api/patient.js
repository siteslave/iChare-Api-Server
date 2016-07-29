'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');
let barcode = require('barcode');

let router = express.Router();

let jwt = require('../../configure/jwt');
let members = require('../../models/member');
let patient = require('../../models/his/patient');
let encrypt = require('../../models/encrypt');

router.get('/members', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let token = req.query.token;

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
  let decoded = req.decoded;
  let memberId = decoded.memberId;
  let encryptedText = req.body.params;

  console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  console.log(decrypted);
  let params = JSON.parse(decrypted);

  // console.log(params);

  if (memberId && params.hashKey) {
    members.clearDefault(db, memberId)
      .then(() => {
        return members.setDefault(db, memberId, params.hashKey);
      })
      .then(() => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err }));
  }
});

router.post('/save-photo', (req, res, next) => {
  let db = req.db;

  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let encryptedText = req.body.params;

  // console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);
  console.log(params.hashKey);

  members.savePhoto(db, memberId, params.hashKey, params.image)
    .then(() => res.send({ ok: true }))
    .catch(err => res.send({ ok: false, msg: err }));
});

router.post('/get-barcode', (req, res, next) => {

  let encryptedText = req.body.params;
  console.log(req.body.params);
  // console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  // console.log(decrypted);
  let params = JSON.parse(decrypted);
  console.log(params.hashKey);
  // let hashKey = params.hashKey;
  // console.log(haskKey);
  let code39 = barcode('code128', {
    data: params.hashKey,
    width: 400,
    height: 100,
  });
  
  code39.getBase64((err, imgsrc) => {
    console.log(imgsrc);
    if (err) res.send({ ok: false, msg: err });
    else res.send({ ok: true, img: imgsrc });
  });

});


module.exports = router;