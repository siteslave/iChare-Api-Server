'use strict';

let express = require('express');
let router = express.Router();
let Title = require('../models/title');
let Sex = require('../models/sex');
let Doctor = require('../models/doctor');

router.get('/title', (req, res, next) => {
  let db = req.db;

  Title.list(db)
    .then(rows => res.send({ ok: true, rows: rows, code: 200 }))
    .catch(err => res.send({ ok: false, msg: err, code: 501 }));
});

router.get('/sex', (req, res, next) => {
  let db = req.db;

  let sex = Sex.list();
  res.send({ ok: true, rows: sex, code: 200 });

});

router.get('/community-service-type', (req, res, next) => {
  let dbHIS = req.dbHIS;

  Doctor.getCommunityServiceType(dbHIS)
    .then(rows => res.send({ ok: true, rows: rows }))
    .catch(err => res.send({ ok: false, msg: err }));
});

module.exports = router;