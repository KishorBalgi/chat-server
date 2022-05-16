const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Transporter:
  // let transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
  // G-Mail:
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_HOST_GMAIL,
    auth: {
      user: process.env.EMAIL_USER_GMAIL,
      pass: process.env.EMAIL_PASS_GMAIL,
    },
  });
  //   Mail options:
  const mailOptions = {
    from: 'Chat App <apps.kishorbalgi@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //   Send Mail:
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
