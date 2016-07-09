'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../../../configure/jwt');
let members = require('../../../models/member');
let patient = require('../../../models/his/patient');

router.get('/members', (req, res, next) => {
  // console.log(req.params);
  // console.log(req.query);
  let dbHIS = req.dbHIS;
  let db = req.db;
  let token = req.query.token;

  let secretKey = jwt.getSecretKey();

  let decodeToken = jwt.decode(token);
  if (decodeToken.ok) {
    console.log(decodeToken.decoded);
    let memberId = decodeToken.decoded.memberId;
    let hns = [];
    let memberPatients = [];

    members.getPatientsHn(db, memberId)
      .then(rows => {
        //res.send({ ok: true, rows: rows })
        memberPatients = rows;
        rows.forEach(v => {
          hns.push(v.patient_hn);
        });

        return patient.getPatientMemberList(dbHIS, hns);
        
      })
      .then(rows => {
        rows.forEach(v => {
          let idx = _.findIndex(memberPatients, { patient_hn: v.hn });
          if (idx > -1) v.hash_key = memberPatients[idx].hash_key;
        });
        
        let ciphertext = cryptojs.AES.encrypt(JSON.stringify(rows), secretKey);
        console.log(ciphertext.toString());
        // Decrypt 
        // var bytes  = cryptojs.AES.decrypt(ciphertext.toString(), secretKey);
        // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        
        res.send({ ok: true, data: ciphertext.toString() });
      })
      .catch(err => res.send({ ok: false, msg: err }));
  } else {
    res.send({ ok: false, msg: decodeToken.msg });
  }
  
});

module.exports = router;