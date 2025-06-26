const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { UserModel, OTPModel } = require("./db.js");
require('dotenv').config();
const mongoose = require("mongoose");
const mongourl = process.env.mongourl;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET2 = process.env.JWT_SECRET2;
const EMAIL = process.env.EMAIL;
const {generateotp,transporter}=require("./functions.js");
const nodemailer = require("nodemailer");


mongoose.connect(mongourl);
app.use(express.json());

app.post("/signup", async (req, res) => {
    const requiredbody = z.object({
        email: z.string().email({ message: "invalid email" }),
        password: z.string().min(5, { message: "Password must be at least 5 characters long and include at least 1 letter, 1 number, and 1 special character." }).refine((val) => {
            return (
                /[A-Za-z]/.test(val) &&     // At least one letter
                /[0-9]/.test(val) &&        // At least one number
                /[^A-Za-z0-9]/.test(val)    // At least one special character
            );
        }, {
            message: "Password must be at least 5 characters long and include at least 1 letter, 1 number, and 1 special character."
        }),
        name: z.string().min(5, { message: "invalid name" })
    });

    const parseddatasuccess = requiredbody.safeParse(req.body);

    if (!parseddatasuccess.success) {
        res.json({
            message: parseddatasuccess.error.issues[0].message
        })
        return;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const hashedpassword = await bcrypt.hash(password, 5);
    try {
        await UserModel.create({
            name,
            email,
            password: hashedpassword
        })

        const user = await UserModel.findOne({
            email: email,
        })
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET)
        res.json({
            token: token,
            message: "you are logged in"
        })
    } catch (e) {
        if (e.code === 11000) { // MongoDB duplicate key error
            res.status(400).json({
                message: "Email already registered"
            });
        }
        else {
            res.status(500).json({
                message: "something wrong in server"
            });
        }
    }
})

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email,
    })

    if (!user) {
        res.status(403).send({
            message: "user does not exist"
        })
        return;
    }

    const passmatch = bcrypt.compare(password, user.password);
    if (passmatch) {
        const otp = generateotp();
        try {
            const old = await OTPModel.findOne({
                id: user._id
            })
            if (old) {
                old.otp = otp;
                old.createdAt = Date.now();
                await old.save(); 
            }
            else {
                await OTPModel.create({
                    id: user._id,
                    otp: otp
                })
            }
        } catch (e) {
            res.status(400).send({
                message: "Server Error"
            })
            return;
        }
        const otptoken = jwt.sign({
            userid: user._id,
        }, JWT_SECRET2, { expiresIn: "10m" });

        let mailOptions = {
            from: EMAIL,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}`
        };

        try {
            await transporter.sendMail(mailOptions);
            res.send({
                message: "otp has been sent to your mail",
                token: otptoken
            });
        }
        catch (e) {
            console.log(e);
            res.status(400).send({
                message: "Backend error"
            });
            return;
        }
    }
    else {
        res.status(403).send({
            message: "Incorrect Credentials"
        });
    }
})

app.listen(3000);