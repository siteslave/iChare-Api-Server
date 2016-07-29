'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');
let moment = require('moment');

let router = express.Router();

let dash = require('../../models/his/dash');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');

router.post('/screening', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let hisScreening = {};
  let ichareScreening = {};
  let currentScreening = {};
  // console.log(memberId)  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      // console.log(rows[0]);
      let hn = rows[0].patient_hn;
      if (rows) {
        dash.getScreening(dbHIS, hn)
          .then(rows => {
            // console.log(rows[0]);
            // labs.hba1c = _.orderBy(rows[0], ['vstdate'], ['asc']);
            hisScreening = rows[0][0];
            // console.log(hisScreening)
            return dash.getHHCLastScreening(db, hn);
          })
          .then(rows => {
            // console.log(rows[0].length);
            if (rows[0].length) {
              ichareScreening = rows[0][0];
              console.log(ichareScreening);
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

            console.log(currentScreening);

            let ciphertext = encrypt.encrypt(currentScreening);
            res.send({ ok: true, data: ciphertext.toString() });
          })
          .catch(err => res.send({ ok: false, msg: err }));
      } else {
        res.send({ ok: false, msg: 'กรุณากำหนดผู้ป่วย เริ่มด้น' });
      }
    })
    .catch(err => res.send({ ok: false, msg: err }));

});


router.post('/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;
  let memberId = decoded.memberId;

  let hisScreening;
  let ichareScreening;
  let currentScreening;
  // console.log(memberId)  
  // get default hn
  member.getDefaultPatient(db, memberId)
    .then(rows => {
      // console.log(rows[0]);
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

            let ciphertext = encrypt.encrypt(screenData);
            res.send({ ok: true, data: ciphertext.toString() });
          })
          .catch(err => res.send({ ok: false, msg: err }));
      } else {
        res.send({ ok: false, msg: 'กรุณากำหนดผู้ป่วย เริ่มด้น' });
      }
    })
    .catch(err => res.send({ ok: false, msg: err }));

});

module.exports = router;