
var nodemailer = require('nodemailer');
var mailConfig = {
  service: 'gmail',
  auth: {
    user: 'noreply.mailsenderaog@gmail.com',
    pass: 'scitmaster987^'// 암호넣기
  }
};

var transporter = nodemailer.createTransport(mailConfig);

module.exports = transporter;
