'use strict';

let express = require('express');
let router = express.Router();
let crypto = require('crypto');

let Users = require('../models/user');

router.post('/changepass', (req, res, next) => {
  let db = req.db;
  let password = req.body.password;

  if (password) {
    let encryptedPass = crypto.createHash('md5').update(password).digest('hex');
    let username = req.session.username;

    Users.changePassword(db, username, encryptedPass)
      .then(rows => res.send({ ok: true }))
      .catch(err => res.send({ ok: false, msg: err, code: 501 }));
  } else {
    res.render('login', {error: 'กรุณาระบุชื่อผู้ใช้งานและรหัสผ่าน'})
  }
});

module.exports = router;