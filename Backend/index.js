const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { UserModel, OTPModel, GroupModel, ExpenseModel,SettlementModel } = require("./db.js");
require('dotenv').config();
const mongoose = require("mongoose");
const mongourl = process.env.mongourl;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET2 = process.env.JWT_SECRET2;
const EMAIL = process.env.EMAIL;
const { generateotp, transporter, auth } = require("./functions.js");
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
        let userdummy;
        userdummy = await UserModel.findOne({
            email: email
        });

        if (userdummy && userdummy.isdummy === true) {
            userdummy.isdummy = false;
            userdummy.name = name;
            userdummy.password = hashedpassword;
            await userdummy.save();
        }
        else if (!userdummy || userdummy.isdummy === false) {
            userdummy = await UserModel.create({
                name,
                email,
                password: hashedpassword
            })
        }
        const token = jwt.sign({
            id: userdummy._id
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

    if (!user || user.isdummy === true) {
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

app.post("/otp", async (req, res) => {
    const otptoken = req.body.token;
    const otp = req.body.otp;

    try {
        let info = jwt.verify(otptoken, JWT_SECRET2);

        const user = await OTPModel.findOne({
            id: info.userid
        })
        if (user.otp == otp) {

            const token = jwt.sign({
                id: info.userid
            }, JWT_SECRET);

            res.send({
                token: token
            });
        }
        else {
            res.send("invalid otp");
        }
    }
    catch (err) {
        res.status(401).send("invalid or expired token");
    }
})

app.post("/creategroup", auth, async (req, res) => {
    const userid = req.userid;
    const name = req.body.name;
    const members = req.body.members;
    const membersid = [];
    membersid.push(userid);
    const availablemembers = [];
    try {

        const newgroup = await GroupModel.create({
            name: name,
            members: membersid
        })

        const groupid = newgroup._id;

        const currentUser = await UserModel.findById(userid);
        availablemembers.push({
            userid: currentUser._id,
            name: currentUser.name,
            email: currentUser.email
        });
        currentUser.groups.push(groupid);
        await currentUser.save();

        for (let i = 0; i < members.length; i++) {
            let friend;
            try {
                friend = await UserModel.findOne({
                    email: members[i].email
                })
            }
            catch (e) {
                res.status(500).send({
                    message: "Backend error"
                })
                return;
            }
            if (friend) {
                friend.groups.push(groupid);
                await friend.save();
                membersid.push(friend._id);
                availablemembers.push({
                    userid: friend._id,
                    name: friend.name,
                    email: friend.email
                });
            }
            else {
                friend = await UserModel.create({
                    name: members[i].name,
                    email: members[i].email,
                    isdummy: true
                })
                friend.groups.push(groupid);
                await friend.save();
                membersid.push(friend._id);
                availablemembers.push({
                    userid: friend._id,
                    name: friend.name,
                    email: friend.email
                });
            }
        }
        // Now make each member friends with all others in the group
        for (let i = 0; i < availablemembers.length; i++) {
            const userA = availablemembers[i];
            const dbUserA = await UserModel.findById(userA.userid);

            for (let j = 0; j < availablemembers.length; j++) {
                if (i === j) continue; // skip self

                const userB = availablemembers[j];

                // Check if already a friend
                const alreadyFriend = dbUserA.friends.some(f => f.userId.toString() === userB.userid.toString());

                if (!alreadyFriend) {
                    dbUserA.friends.push({
                        userId: userB.userid,
                        name: userB.name,
                        email: userB.email,
                        personalBalance: 0
                    });
                }
            }

            await dbUserA.save();
        }

        newgroup.members = membersid;
        await newgroup.save();

        res.status(200).json({
            message: "Group created successfully",
            groupId: groupid
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: "Backend error while group creation"
        })
        return;
    }
})

app.post("/CreateFriend", auth, async (req, res) => {
    const userid = req.userid;
    const name = req.body.name;
    const email = req.body.email;

    let friend;
    try {
        friend = await UserModel.findOne({
            email: email
        })
        if (!friend) {
            friend = await UserModel.create({
                name: name,
                email: email,
                isdummy: true
            })
        }
        const CurrentUser = await UserModel.findOne({
            _id: userid
        })

        const alreadyFriend = CurrentUser.friends.some(f => f.userId.toString() === friend._id.toString());

        if (!alreadyFriend) {
            CurrentUser.friends.push({
                userId: friend._id,
                name: friend.name,
                email: friend.email,
                personalBalance: 0
            });
            await CurrentUser.save();

            friend.friends.push({
                userId: CurrentUser._id,
                name: CurrentUser.name,
                email: CurrentUser.email,
                personalBalance: 0
            })
            await friend.save();
        }
        else {
            return res.status(200).json({
                message: "Already Friend"
            });
        }
        res.status(200).json({
            message: "Friend added successfully"
        });
    }
    catch (e) {
        res.status(500).send({
            message: "Backend error"
        })
    }
})

app.post("/CreatefriendsExpense", auth, async (req, res) => {
    const userid = req.userid;
    const paidby = req.body.paidby;
        let amount = req.body.amount;
    amount=parseInt(amount);
    const description = req.body.description;
    const splitBetween = req.body.splitBetween;

    try {
        const paiduser = await UserModel.findOne({
            _id: paidby
        })
        for (let i = 0; i < splitBetween.length; i++) {
            if (paidby != splitBetween[i].userId) {
                const current = await UserModel.findOne({
                    _id: splitBetween[i].userId
                })
                const friendIndex = paiduser.friends.findIndex(f =>
                    f.userId.toString() === splitBetween[i].userId.toString()
                );
                paiduser.friends[friendIndex].personalBalance += splitBetween[i].share;
                await paiduser.save();

                const paiduserIndex = current.friends.findIndex(f =>
                    f.userId.toString() === paiduser._id.toString()
                );
                current.friends[paiduserIndex].personalBalance -= splitBetween[i].share;
                await current.save();
            }
        }
        await ExpenseModel.create({
            createdby: userid,
            groupId: null,
            paidBy: paidby,
            amount: amount,
            description: description,
            splitBetween: splitBetween
        })
        res.status(200).send({
            message: "Expense created successfully"
        })
    } catch (e) {
        res.status(500).send({
            message: "Backend error"
        })
    }
})

app.post("/CreategroupExpense", auth, async (req, res) => {
    const userid = req.userid;
    const groupid = req.body.groupid;
    const paidby = req.body.paidby;
        let amount = req.body.amount;
    amount=parseInt(amount);
    const description = req.body.description;
    const splitBetween = req.body.splitBetween;

    try {
        const group = await GroupModel.findById(groupid);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        for (let i = 0; i < splitBetween.length; i++) {
            const memberId = splitBetween[i].userId;
            const share = splitBetween[i].share;

            if (memberId === paidby) continue;

            
            let existingIndex = group.balances.findIndex(b =>
                b.from.toString() === memberId.toString() && b.to.toString() === paidby.toString()
            );

            if (existingIndex !== -1) {
               
                group.balances[existingIndex].amount += share;
            } else {
                
                let reverseIndex = group.balances.findIndex(b =>
                    b.from.toString() === paidby.toString() && b.to.toString() === memberId.toString()
                );

                if (reverseIndex !== -1) {
                    let existingAmount = group.balances[reverseIndex].amount;

                    if (existingAmount > share) {
                        group.balances[reverseIndex].amount -= share;
                    } else if (existingAmount < share) {
                        
                        group.balances.splice(reverseIndex, 1);
                        group.balances.push({
                            from: memberId,
                            to: paidby,
                            amount: share - existingAmount
                        });
                    } else {
                     
                        group.balances.splice(reverseIndex, 1);
                    }
                } else {
                  
                    group.balances.push({
                        from: memberId,
                        to: paidby,
                        amount: share
                    });
                }
            }
        }

        await group.save();

        await ExpenseModel.create({
            createdby: userid,
            groupId: groupid,
            paidBy: paidby,
            amount: amount,
            description: description,
            splitBetween: splitBetween
        });

        res.status(200).json({ message: "Group expense added successfully" });

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Backend error" });
    }
});

app.post("/CreatefriendsSettlement", auth, async (req, res) => {
    const userid = req.userid;
    const friendid = req.body.friendid;
    let amount = req.body.amount;
    amount=parseInt(amount);
    
    try {
        const user = await UserModel.findOne({
            _id: userid
        })
        
        let friendindex=user.friends.findIndex(f=>f.userId.toString()===friendid.toString());
        if(friendindex!=-1)
        {
            user.friends[friendindex].personalBalance-=amount;       
        }

        const friend = await UserModel.findOne({
            _id: friendid
        })

        let userindex=friend.friends.findIndex(f=>f.userId.toString()===userid.toString());
        if(userindex!=-1)
        {
           friend.friends[userindex].personalBalance+=amount;       
        }
        
        await user.save();
        await friend.save();

        await SettlementModel.create({
            groupId:null,
            from:userid,
            to:friendid,
            amount:amount
        })

        res.status(200).send({
            message: "Settlement created successfully"
        })
    } catch (e) {
        res.status(500).send({
            message: "Backend error"
        })
    }
})

app.post("/CreategroupSettlement", auth,async (req, res) => {
    const userid = req.userid;
    const groupid=req.body.groupid;
    const friendid = req.body.friendid;
    let amount = req.body.amount;
    amount=parseInt(amount);
    
    try {
        const group=await GroupModel.findOne({
            _id:groupid
        })
         
        let existingIndex = group.balances.findIndex(b =>
                b.from.toString() === userid.toString() && b.to.toString() === friendid.toString()
            );
         if(existingIndex!=-1)
         {
            if(group.balances[existingIndex].amount>amount){
                group.balances[existingIndex].amount-=amount;
            }

            else if(group.balances[existingIndex].amount<amount)
            {
                let existingamount=group.balances[existingIndex].amount;
                group.balances.splice(existingIndex,1);
                 group.balances.push({
                            from: friendid,
                            to: userid,
                            amount: amount-existingamount
                        });
            }
            else{
             group.balances.splice(existingIndex,1);
            }
         }
         else
         {
             let reverseIndex = group.balances.findIndex(b =>
                b.from.toString() === friendid.toString() && b.to.toString() === userid.toString()
            );
          if (reverseIndex !== -1) {
                group.balances[reverseIndex].amount += amount;
            } else {
                group.balances.push({
                    from: friendid,
                    to: userid,
                    amount: amount
                });
            }
         }

         await group.save();
        await SettlementModel.create({
            groupId:groupid,
            from:userid,
            to:friendid,
            amount:amount
        })

        res.status(200).send({
            message: "Settlement created successfully"
        })
    } catch (e) {
        res.status(500).send({
            message: "Backend error"
        })
    }
})
app.listen(3000);