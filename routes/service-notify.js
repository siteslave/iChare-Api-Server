'use strict';

let express = require('express');
let _ = require('lodash');
let cryptojs = require('crypto-js');

let router = express.Router();

let jwt = require('../configure/jwt');
let members = require('../models/member');
let patient = require('../models/his/patient');
let encrypt = require('../models/encrypt');

router.post('/list', (req, res, next) => {
  let db = req.db;
  let dbHIS = req.dbHIS;
  let date = req.body.date;
  // get hns 
  members.getAllPatientsHn(db)
    .then(rows => {
      let hns = [];
      rows.forEach(v => {
        hns.push(v.patient_hn);
      });
      console.log(hns);
      // get service by date
      return patient.getVisitListByDate(dbHIS, hns, date);
    })
    .then(rows => res.send({ ok: true, rows: rows }))
    .catch(err => res.send({ ok: false, msg: err }));

});

module.exports = router;

