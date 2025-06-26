const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const {UserModel}=require("./db.js");
require('dotenv').config();
const mongoose = require("mongoose");
const mongourl=process.env.mongourl;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET2 = process.env.JWT_SECRET2;

mongoose.connect(mongourl);
app.use(express.json());

app.post("/signup", async (req, res) => {
    const requiredbody = z.object({
        email: z.string().email({ message: "invalid email" }),
        password: z.string().min(5,{message: "Password must be at least 5 characters long and include at least 1 letter, 1 number, and 1 special character."}).refine((val) => {
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

app.listen(3000);