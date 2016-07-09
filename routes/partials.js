'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.send({ok: true, msg: 'Welcome ot iChare API Server.', code: 201});
});

router.get('/members/main', (req, res, next) => {
  res.render('members/partials/main')
});

module.exports = router;
