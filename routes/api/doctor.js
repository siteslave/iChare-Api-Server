'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');
let moment = require('moment');

let router = express.Router();

let doctor = require('../../models/doctor');
let encrypt = require('../../models/encrypt');

router.post('/hhc', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let doctorId = decoded.id;

  console.log(decoded);
  console.log(req.body);

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  let data = {
    hn: params.hn,
    date_serv: params.dateServ,
    time_serv: params.timeServ,
    community_service_id: params.communityServiceId,
    cc: params.cc,
    sbp: params.sbp,
    dbp: params.dbp,
    weight: params.weight,
    height: params.height,
    fbs: params.fbs,
    advice: params.advice,
    pluse: params.pluse,
    doctor_id: doctorId,
    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
  };

  // check duplicated
  doctor.checkHhcDuplicated(db, params.dateServ, params.communityServiceId)
    .then(rows => {
      if (rows[0].total) {
        res.send({ ok: false, msg: 'รายการเยี่ยมซ้ำ' })
      } else {
        doctor.saveHhc(db, data)
          .then(() => {
            res.send({ ok: true });
          })
          .catch(err => {
            console.log(err);
            res.send({ ok: false, msg: err })
          });
      }
    });
});

router.post('/hhc/history', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let doctorId = decoded.id;

  console.log(decoded);

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  let hn = params.hn;
  
  doctor.getHhcHistory(db, hn)
    .then(rows =>  res.send({ ok: true, rows: rows }))
    .catch(err => res.send({ ok: false, msg: err }));
});

router.put('/hhc', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let doctorId = decoded.id;

  console.log(decoded);

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  let id = params.id;

  doctor.checkIsOwner(db, id, doctorId)
    .then(rows => {
      if (rows[0].total) {

        let data = {
          date_serv: params.dateServ,
          time_serv: params.timeServ,
          community_service_id: params.communityServiceId,
          cc: params.cc,
          sbp: params.sbp,
          dbp: params.dbp,
          weight: params.weight,
          height: params.height,
          fbs: params.fbs,
          advice: params.advice,
          pluse: params.pluse,
          updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        doctor.updateHhc(db, id, data)
          .then(rows => res.send({ ok: true, rows: rows }))
          .catch(err => res.send({ ok: false, msg: err }));
      } else {
        res.send({ok: false, msg: 'คุณไม่ใช่เจ้าของกิจกรรมนี้ ไม่สามารถแก้ไขหรือลบได้'})
      }
    });

});

router.post('/hhc/delete', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let doctorId = decoded.id;

  console.log(decoded);

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  let id = params.id;

  doctor.checkIsOwner(db, id, doctorId)
    .then(rows => {
      if (rows[0].total) {

        doctor.remove(db, id)
          .then(() => res.send({ ok: true }))
          .catch(err => res.send({ ok: false, msg: err }));
      } else {
        res.send({ok: false, msg: 'คุณไม่ใช่เจ้าของกิจกรรมนี้ ไม่สามารถแก้ไขหรือลบได้'})
      }
    });

});

router.post('/hhc/search', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let doctorId = decoded.id;

  console.log(decoded);

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  let hashKey = params.hashKey;

  doctor.search(db, hashKey)
    .then(rows => res.send({ ok: true, rows: rows }))
    .catch(err => res.send({ ok: false, msg: err }));

});

router.post('/hhc/detail', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;

  let id = req.body.id;
  
  doctor.getHhcDetail(db, id)
    .then(rows => {
      res.send({ ok: true, rows: rows[0] })
        .catch(err => res.send({ ok: false, msg: err }));
    });

});

module.exports = router;