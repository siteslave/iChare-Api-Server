'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  // res.send({ok: true, msg: 'Welcome ot iChare API Server.', code: 201});
  res.render('index', {title: 'iChare: Members Management System'})
  // res.redirect('/login');
});

module.exports = router;
