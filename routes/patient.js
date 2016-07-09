'use strict';

let express = require('express');
let router = express.Router();
let Patient = require('../models/his/patient');

router.post('/search', (req, res, next) => {
  let db = req.dbHIS;
  let cid = req.body.cid;

  if (cid) {
    Patient.search(db, cid)
      .then(rows => res.send({ ok: true, rows: rows[0], code: 200 }))
      .catch(err => res.send({ ok: false, msg: err, code: 501 }));
  } else {
    res.send({ ok: fale, msg: 'CID Not found!', code: 501 });
  }

});

module.exports = router;