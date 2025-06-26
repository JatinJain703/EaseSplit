const nodemailer = require("nodemailer");
require('dotenv').config();

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

function auth(req,res,next)
{
    const token=req.headers.token;
    const user=jwt.verify(token,JWT_SECRET);
    if(!user)
    {
        res.status(400).send({
            message:"You are not logged in!!"
        })
    }
    else{
        req.user=user.id;
        next();
    }
}

// ✅ Export the functions for CommonJS
module.exports = {
  generateotp,
  transporter,
  auth
};
