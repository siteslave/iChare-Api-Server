'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../../configure/jwt');
let lab = require('../../models/his/lab');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;

  let encryptedText = req.body.params;
  let memberId = req.body.memberId;
  
  member.getSessionKey(db, memberId)
    .then(rows => {
      let data = rows[0];
      let sessionKey = data.session_key;
      let decrypted = encrypt.decrypt(encryptedText, sessionKey);

      let params = JSON.parse(decrypted);
      let token = params.token;

      jwt.verify(token)
        .then(decoded => {
          let labs = {};
  
          member.getDefaultPatient(db, memberId)
            .then(rows => {
              let hn = rows[0].patient_hn;
              if (rows) {
                lab.getEGfr(dbHIS, hn)
                  .then(rows => {
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
                    let ciphertext = encrypt.encrypt(labs, sessionKey);
                    res.send({ ok: true, data: ciphertext.toString() });
                  })
                  .catch(err => res.send({ ok: false, msg: err }));
              } else {
                res.send({ ok: false, msg: 'กรุณากำหนดผู้ป่วย เริ่มด้น' });
              }
            })
            .catch(err => res.send({ ok: false, msg: err }));
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => res.send({ ok: false, msg: err }));  


});

module.exports = router;