'use strict';

let express = require('express');
let router = express.Router();
let crypto = require('crypto');

let Users = require('../models/user');


router.get('/', (req, res, next) => {
  res.render('login')
});

router.post('/', (req, res, next) => {
  let db = req.db;
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    let encryptedPass = crypto.createHash('md5').update(password).digest('hex');

    Users.doLogin(db, username, encryptedPass)
      .then(rows => {
        console.log(rows[0].total);
        if (rows[0].total) {
          req.session.logged = true;
          req.session.username = username;
          res.redirect('/');
        } else {
          res.render('login', { error: 'ชื่อผู้ใช้งาน/รหัสผ่าน ไม่ถูกต้อง' });
        }
    })
  } else {
    res.render('login', {error: 'กรุณาระบุชื่อผู้ใช้งานและรหัสผ่าน'})
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (!err) {
      res.redirect('/login')
    }
  })
});

module.exports = router;
