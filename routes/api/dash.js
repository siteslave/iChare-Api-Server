'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');
let moment = require('moment');

let router = express.Router();

let jwt = require('../../configure/jwt');
let dash = require('../../models/his/dash');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/screening', (req, res, next) => {
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
          let hisScreening = {};
          let ichareScreening = {};
          let currentScreening = {};
          member.getDefaultPatient(db, memberId)
            .then(rows => {
              let hn = rows[0].patient_hn;
              if (rows) {
                dash.getScreening(dbHIS, hn)
                  .then(rows => {
                    hisScreening = rows[0][0];
                    return dash.getHHCLastScreening(db, hn);
                  })
                  .then(rows => {
                    if (rows[0].length) {
                      ichareScreening = rows[0][0];
                      if (moment(ichareScreening.date_serv).isValid()) {
                        let checkLast = moment(hisScreening.vstdate).isAfter(ichareScreening.date_serv);
                        if (checkLast) {
                          currentScreening = hisScreening;
                        } else {
                          currentScreening = ichareScreening;
                        }
                      } else {
                        currentScreening = hisScreening;
                      }
                    } else {
                      currentScreening = hisScreening;
                    }

                    let ciphertext = encrypt.encrypt(currentScreening, sessionKey);
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
          let hisScreening;
          let ichareScreening;
          let currentScreening;

          member.getDefaultPatient(db, memberId)
            .then(rows => {
              let hn = rows[0].patient_hn;
              if (rows) {
                dash.getHISScreeningHistory(dbHIS, hn)
                  .then(rows => {
                    hisScreening = rows[0];
                    return dash.getHHCLastScreeningHistory(db, hn);
                  })
                  .then(rows => {
                    ichareScreening = rows[0];
                    currentScreening = _.union(hisScreening, ichareScreening);
                    let screening = _.orderBy(currentScreening, ['vstdate'], ['desc']);
                    let sampleData = _.take(screening, 5);
                    let screenData = _.orderBy(sampleData, ['vstdate'], ['asc']);
                    console.log(screenData);

                    let ciphertext = encrypt.encrypt(screenData, sessionKey);
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