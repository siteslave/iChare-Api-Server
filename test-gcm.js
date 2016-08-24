var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('title', 'แจ้งเตือนนัดหมาย');
message.addData('message', 'มีคนไข้ในความดูแลใกล้ถึงเวลานัดหมาย');
message.addData('sessionKey', 'afdslkfsdlfdslkfsdlkf');
message.addData('content-available', true);

var regTokens = ['cbsXfr-nzfA:APA91bGOH44LQrOD0izfNFrsiEOvfYT6YDUq7hCp9V_QRlTIUD14JcxhoXrh3zNLjsCa1--ZrFanrmsor9OFVahw23l3qqnclSXIYUTStKsRtH8ShdY7VeS0IIjVHh80tr_JSJNhHFJt'];

// Set up the sender with you API key
var sender = new gcm.Sender('AIzaSyDr5KevzaUWybBXVBM2Exy0wJRp4a_2y8g');

// Now the sender can be used to send messages
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) console.log(err);
    else    console.log(response);
});