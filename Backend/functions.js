const nodemailer = require("nodemailer");
require('dotenv').config();
const jwt = require("jsonwebtoken");

const EMAIL = process.env.EMAIL;
const emailpass = process.env.pass;
const JWT_SECRET = process.env.JWT_SECRET;

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



module.exports = {
  generateotp,
  transporter
};
