'use strict';

let express = require('express');
let router = express.Router();
let moment = require('moment');
let crypto = require('crypto');
let hat = require('hat');

let Member = require('../models/member');
let Patient = require('../models/his/patient');
// POST  /members/
router.post('/', (req, res, next) => {
  let db = req.db;

  let member = req.body.member;

  if (member.cid && member.firstName && member.lastName && member.birthDate) {
    // check member duplicated
    Member.isMemberExist(db, member.cid)
      .then(rows => {
        let total = rows[0].total;
        if (total) {
          res.send({ ok: false, msg: 'เคยลงทะเบียนแล้ว ไม่สามารถลงทะเบียนได้อีก', code: 501 });
        } else {
        let _member = {};
        _member.cid = member.cid;
        _member.title_id = member.titleId;
        _member.sex = member.sex;
        _member.first_name = member.firstName;
        _member.last_name = member.lastName;
        _member.birthdate = member.birthDate;
        _member.telephone = member.telephone;
        _member.email = member.email;
        _member.active_status = member.activeStatus;
        _member.register_date = member.registerDate;
        _member.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        _member.username = member.username;
        _member.password = crypto.createHash('md5').update(member.password).digest('hex');

        Member.save(db, _member)
          .then((memberId) => {
            let data = [];
            member.patients.forEach(v => {
              let obj = {};
              obj.member_id = memberId[0];
              obj.patient_hn = v;
              obj.active_status = 'Y';
              obj.hash_key = hat();
              data.push(obj);
              console.log(obj);
            });
            return Member.savePatient(db, data);
          })
          .then(() => {
            res.send({ ok: true });
          })
          .catch(err => {
            res.send({ ok: false, msg: err, code: 501 });
          });
        }
      })
      .catch(err => {
        res.send({ ok: false, msg: err, code: 501 });
      });
  } else {
    res.send({ ok: false, msg: 'Data incomplete', code: 501 });
  }
});
// PUT  /members/
router.put('/', (req, res, next) => {
  let db = req.db;

  let member = req.body.member;

  if (member.memberId && member.cid && member.firstName && member.lastName && member.birthDate) {
    let memberData = {};
    let memberId = member.memberId;
    memberData.title_id = member.titleId;
    memberData.sex = member.sex;
    memberData.first_name = member.firstName;
    memberData.last_name = member.lastName;
    memberData.birthdate = member.birthDate;
    memberData.telephone = member.telephone;
    memberData.email = member.email;
    memberData.active_status = member.ativeStatus;
    memberData.register_date = member.registerDate;
    memberData.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

    Member.update(db, memberId, memberData)
      .then(() => {
        console.log('success update');
        // remove member patients
        return Member.removePatient(db, memberId);
      })
      .then(() => {
        console.log('success remove patient');
        let data = [];
        member.patients.forEach(v => {
          let obj = {};
          obj.member_id = memberId;
          obj.patient_hn = v;
          obj.active_status = 'Y';
          obj.hash_key = hat();
          data.push(obj);
        });
        return Member.savePatient(db, data);
      })
      .then(() => {
        res.send({ ok: true });
      })
      .catch(err => {
        res.send({ ok: false, msg: err, code: 501 });
      });

  } else {
    res.send({ ok: false, msg: 'Data incomplete', code: 501 });
  }
});
// GET /members/1
router.get('/:id', (req, res, next) => {
  let memberId = req.params.id;
  let db = req.db;
  let dbHIS = req.dbHIS;

  let member = {};

  Member.detail(db, memberId)
    .then(rows => {
      member.detail = rows[0];
      // console.log(member);
      // get patient hn
      return Member.getPatients(db, memberId);
    })
    .then(rows => {
      // console.log(rows);
      let hns = [];
      rows.forEach(v => {
        hns.push(v.patient_hn);
      });
      console.log(hns);
      return Patient.getPatientMember(dbHIS, hns);
    })
    .then(rows => {
      // console.log(rows);
      member.patients = rows;
      res.send({ok: true, rows: member})
    })
    .catch(err => res.send({ ok: false, msg: err }));
});

router.post('/list', (req, res, next) => {
  let db = req.db;
  let limit = req.body.limit;
  let offset = req.body.offset;

  Member.list(db, limit, offset)
    .then(rows => res.send({ ok: true, rows: rows }))
    .catch(err => res.send({ ok: false, msg: err, code: 501 }));
});

router.post('/total', (req, res, next) => {
  let db = req.db;

  Member.total(db)
    .then(rows => res.send({ ok: true, total: rows[0].total }))
    .catch(err => res.send({ ok: false, msg: err, code: 501 }));
});

router.put('/changepass', (req, res, next) => {
  let db = req.db;
  let memberId = req.body.memberId;
  let password = req.body.password;

  let encryptedPass = crypto.createHash('md5').update(password).digest('hex');

  Member.changePassword(db, memberId, encryptedPass)
    .then(() => res.send({ ok: true }))
    .catch(err => res.send({ ok: false, msg: err }));
});

router.post('/search', (req, res, next) => {
  let db = req.db;
  let query = req.body.query;

  if (query) {
    if (isNaN(query)) {
      // search by first name
      Member.searchByFirstName(db, query)
        .then(rows => res.send({ ok: true, rows: rows }))
        .catch(err => res.send({ ok: false, msg: err, code: 501 }));
    } else {
      // search by cid
      Member.searchByCid(db, query)
        .then(rows => res.send({ ok: true, rows: rows }))
        .catch(err => res.send({ ok: false, msg: err, code: 501 }));
    }
  } else {
    res.send({ ok: false, msg: 'No query found' });
  }
});

router.put('/active', (req, res, next) => {
  let status = req.body.status;
  let memberId = req.body.memberId;
  let db = req.db;

  if (memberId && status) {
    Member.setActive(db, memberId, status)
      .then(() => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err, code: 501 }));
  } else {
    res.send({ ok: false, msg: 'Parameters not found', code: 501 });
  }
});

module.exports = router;
