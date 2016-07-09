'use strict';

let express = require('express');
let router = express.Router();

router.get('/members/new', (req, res, next) => {
  res.render('members/dialogs/new')
});

router.get('/members/update', (req, res, next) => {
  res.render('members/dialogs/update')
});

module.exports = router;