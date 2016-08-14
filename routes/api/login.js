'use strict';

let express = require('express');
let router = express.Router();
let crypto = require('crypto');
let hat = require('hat');
let gcm = require('node-gcm');
let moment = require('moment');

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

  let masterKey = encrypt.getMasterKey();
  
  // console.log(encryptedText);

  let decrypted = encrypt.decrypt(encryptedText, masterKey);
  let params = JSON.parse(decrypted);
  console.log(params);
  // check username and password 
  if (params.username && params.password) {
    let encryptPassword = crypto.createHash('md5').update(params.password).digest('hex');
    // console.log(encryptPassword);
    let db = req.db;

    member.checkAuth(db, params.username, encryptPassword)
      .then(rows => {
        console.log(rows);
        if (rows.length) {
          // let fullname = `${rows[0].first_name} ${rows[0].last_name}`;
          let sessionKey = hat();
          console.log('sessionKey: ' + sessionKey);

          let token = jwt.sign({ memberId: rows[0].member_id });
          let created_at = moment().format('YYYY-MM-DD HH:mm:ss');
          let data = { member_id: rows[0].member_id, session_key: sessionKey, token: token, created_at: created_at };

          member.saveSessionKey(db, data)
            .then(() => {
              res.send({ ok: true, memberId: rows[0].member_id });
            })
            .catch(err => {
              res.send({ ok: false, msg: err });
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

router.post('/send/session_key', (req, res, next) => {

  let encryptedText = req.body.params;
  let db = req.db;

  console.log(encryptedText);
  let masterKey = encrypt.getMasterKey();

  let decrypted = encrypt.decrypt(encryptedText, masterKey);
  let params = JSON.parse(decrypted);  

  let memberId = params.memberId;
  let deviceToken = null;
  let fullname = null;

  member.getDeviceToken(db, memberId)
    .then(rows => {
      deviceToken = rows[0].device_token;
      fullname = `${rows[0].first_name} ${rows[0].last_name}`;

      return member.getSessionKey(db, memberId);
    })
    .then(rows => {
      let data = rows[0];
      let sessionKey = data.session_key;
      let token = data.token;
      // encrypt data
      let _data = { token: token, sessionKey: sessionKey, fullname: fullname, memberId: data.member_id };      
      console.log(_data);

      let encryptedData = encrypt.encrypt(_data, masterKey);

      // console.log(encryptedData);

      // send sessionKey to GCM

      let message = new gcm.Message();

      message.addData('title', 'Session key');
      message.addData('message', 'รหัสลับสำหรับใช้งาน');
      message.addData('key', encryptedData );
      message.addData('content-available', true);

      let regTokens = [deviceToken];

      // Set up the sender with you API key
      let sender = new gcm.Sender('AIzaSyDr5KevzaUWybBXVBM2Exy0wJRp4a_2y8g');

      // Now the sender can be used to send messages
      sender.send(message, { registrationTokens: regTokens }, (err, response) => {
        if (err) {
          console.log(err);
          res.send({ ok: false, msg: err });
        } else {
          console.log(response);
          res.send({ ok: true });
        }
      });  
    });

});

router.post('/register/device', (req, res, next) => {
  let db = req.db;
  let encryptedText = req.body.params;
  let masterKey = encrypt.getMasterKey();
  let decrypted = encrypt.decrypt(encryptedText, masterKey);

  let params = JSON.parse(decrypted);
  console.log('----');
  console.log(params);

  member.saveDeviceToken(db, params.memberId, params.deviceToken)
    .then(() => {
      res.send({ ok: true });
    })
    .catch(err => {
      console.log(err);
      res.send({ ok: false, msg: err })
    });
  
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