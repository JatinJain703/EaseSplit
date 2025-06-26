const nodemailer = require("nodemailer");
require('dotenv').config();

const EMAIL = process.env.EMAIL;
const emailpass = process.env.pass;

function generateotp() {
  return Math.floor(100000 + Math.random() * 900000);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: emailpass
  }
});


// ✅ Export the functions for CommonJS
module.exports = {
  generateotp,
  transporter
};
