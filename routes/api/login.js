'use strict';

let express = require('express');
let router = express.Router();
let crypto = require('crypto');

let jwt = require('../../configure/jwt');
let member = require('../../models/member');
let encrypt = require('../../models/encrypt');
let doctor = require('../../models/doctor');


router.get('/', (req, res, next) => {
  res.send({ok: true})
});

router.post('/', (req, res, next) => {

  // console.log(req.body);
  // console.log(req.body.username);
  // console.log(req.body.password);

  let encryptedText = req.body.params;

  console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  let secretKey = jwt.getSecretKey();
  
  // check username and password 
  if (params.username && params.password) {
    let encryptPassword = crypto.createHash('md5').update(params.password).digest('hex');
    // console.log(encryptPassword);
    let db = req.db;

    member.checkAuth(db, params.username, encryptPassword)
      .then(rows => {
        console.log(rows);
        if (rows.length) {
          let fullname = `${rows[0].first_name} ${rows[0].last_name}`;

          let token = jwt.sign({ memberId: rows[0].member_id, fullname: fullname });
          // let token = jwt.sign({ 
          //   fullname: fullname }, secretKey, {
          //   expiresIn: "1d"
          // });

          res.send({
            ok: true,
            msg: 'Login success',
            token: token,
            code: 201
          });
        } else {
          res.send({ok: false, msg: 'ชื่อผู้ใช้งาน/รหัสผ่าน ไม่ถูกต้อง'})
        }
      })
      .catch(err => res.send({ ok: false, msg: err, code: 501 }));

  } else {
    res.send({ ok: false, msg: 'กรุณาระบุชื่อผู้ใช้งาน และ รหัสผ่าน', code: 201 });
  }

});

router.post('/doctor', (req, res, next) => {

  // console.log(req.body);
  // console.log(req.body.username);
  // console.log(req.body.password);

  let encryptedText = req.body.params;

  console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText);
  let params = JSON.parse(decrypted);

  let secretKey = jwt.getSecretKey();
  
  // check username and password 
  if (params.username && params.password) {
    let encryptPassword = crypto.createHash('md5').update(params.password).digest('hex');
    // console.log(encryptPassword);
    let db = req.db;

    doctor.doLogin(db, params.username, encryptPassword)
      .then(rows => {
        console.log(rows);
        if (rows.length) {
          let fullname = `${rows[0].first_name} ${rows[0].last_name}`;

          let token = jwt.sign({ id: rows[0].id, fullname: fullname });

          res.send({
            ok: true,
            token: token
          });
        } else {
          res.send({ok: false, msg: 'ชื่อผู้ใช้งาน/รหัสผ่าน ไม่ถูกต้อง'})
        }
      })
      .catch(err => res.send({ ok: false, msg: err, code: 501 }));

  } else {
    res.send({ ok: false, msg: 'กรุณาระบุชื่อผู้ใช้งาน และ รหัสผ่าน', code: 201 });
  }

});

module.exports = router;