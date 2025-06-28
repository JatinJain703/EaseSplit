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

function auth(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.userid = user.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}


// ✅ Export the functions for CommonJS
module.exports = {
  generateotp,
  transporter,
  auth
};
