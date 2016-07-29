'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');
let moment = require('moment');

let router = express.Router();

let doctor = require('../../models/doctor');
let encrypt = require('../../models/encrypt');
let member = require('../../models/member');
let opd = require('../../models/his/opd');

router.post('/hhc', (req, res, next) => {
  let db = req.db;
  let decoded = req.decoded;
  let doctorId = decoded.id;

  console.log(decoded);
  console.log(req.body);

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);
  let data;

  member.getPatientHnFromHashKey(db, params.hashKey)
    .then(rows => {
      console.log(rows);
      let hn = rows[0].patient_hn;
      data = {
          hn: hn,
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

      return doctor.checkHhcDuplicated(db, params.dateServ, params.communityServiceId);
    })
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

  member.getPatientHnFromHashKey(db, params.hashKey)
    .then(rows => {
      console.log(rows);
      let hn = rows[0].patient_hn;
      return doctor.getHhcHistory(db, hn);
    })
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


router.post('/service/history', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  console.log(params);

  let hashKey = params.hashKey;
  // get hn
  member.getPatientHnFromHashKey(db, hashKey)
    .then(rows => {
      console.log(rows);
      let hn = rows[0].patient_hn;
      return opd.getService(dbHIS, hn);
    })
    .then(rows => {
      console.log(rows[0]);
      let ciphertext = encrypt.encrypt(rows[0]);
      res.send({ ok: true, data: ciphertext.toString() });
    })
    .catch(err => res.send({ ok: false, msg: err }));
  
});

router.post('/service/detail', (req, res, next) => {
  let dbHIS = req.dbHIS;
  let db = req.db;
  let decoded = req.decoded;

  let encryptedText = req.body.params;

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);
  console.log(params);

  let vn = params.vn;
  
  let details = {};

  opd.getScreening(dbHIS, vn)
    .then(rows => {
      details.screening = rows[0][0];
      console.log(rows[0]);
      return opd.getDiag(dbHIS, vn)
    })
    .then(rows => {
      details.diag = rows[0];
      console.log(rows[0]);
      return opd.getDiag(dbHIS, vn)
    })
    .then(rows => {
      details.diag = rows[0];
      return opd.getDrug(dbHIS, vn);
    })
    .then(rows => {
      details.drug = rows[0];
      let ciphertext = encrypt.encrypt(details);
      res.send({ ok: true, data: ciphertext.toString() });
    })
    .catch(err => res.send({ ok: false, msg: err }));
  
});


module.exports = router;