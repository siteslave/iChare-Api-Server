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

router.post('/members', (req, res, next) => {
  let dbHIS = req.dbHIS;
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

      jwt.verify(token)
        .then(decoded => {
          let hns = [];
          let memberPatients = [];

          members.getPatientMemberList(db, memberId)
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

router.post('/set-default', (req, res, next) => {
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

      jwt.verify(token)
        .then(decoded => {
            if (memberId && params.hashKey) {
              members.clearDefault(db, memberId)
                .then(() => {
                  return members.setDefault(db, memberId, params.hashKey);
                })
                .then(() => res.send({ ok: true }))
                .catch(err => res.send({ ok: false, msg: err }));
            } else {
              res.send({ ok: false, msg: 'Invalid member id and hash key' });
          }
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => res.send({ ok: false, msg: err }));
});

router.post('/save-photo', (req, res, next) => {
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

      jwt.verify(token)
        .then(decoded => {
            
          members.savePhoto(db, memberId, params.hashKey, params.image)
            .then(() => res.send({ ok: true }))
            .catch(err => res.send({ ok: false, msg: err }));
          
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => res.send({ ok: false, msg: err }));  
  
});

router.post('/get-barcode', (req, res, next) => {

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
      let hashKey = params.hashKey;

      jwt.verify(token)
        .then(decoded => {
    
          let code39 = barcode('code128', {
            data: hashKey,
            width: 400,
            height: 100,
          });
  
          code39.getBase64((err, imgsrc) => {
            // console.log(imgsrc);
            if (err) res.send({ ok: false, msg: err });
            else res.send({ ok: true, img: imgsrc });
          });
          
        }, err => {
          console.log(err);
          res.status(403).send({ ok: false, msg: 'Forbidden' });
        });
    }, err => res.send({ ok: false, msg: err }));  

});


module.exports = router;