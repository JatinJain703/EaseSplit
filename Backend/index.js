const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { z, promise } = require("zod");
const jwt = require("jsonwebtoken");
const { UserModel, OTPModel, GroupModel, ExpenseModel, SettlementModel } = require("./db.js");
require('dotenv').config();
const mongoose = require("mongoose");
const mongourl = process.env.mongourl;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET2 = process.env.JWT_SECRET2;
const EMAIL = process.env.EMAIL;
const { generateotp } = require("./functions.js");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const PORT = 3000;
mongoose.connect(mongourl);
app.use(express.json());
app.use(cors());

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
    
    if(user.provider!=="local"){
        return res.status(400).json({
            message: "This account was created using a third-party provider"
        })
    }

    const passmatch = bcrypt.compare(password, user.password);
    if (passmatch) {
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET);

        res.status(200).send({
            token: token
        });
    }
    else {
        res.status(403).send({
            message: "Incorrect Credentials"
        });
    }
})

app.post("/oauth/google", async (req, res) => {
    try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { name, email, sub } = payload;

    
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name,
        email,
        password: null,
        provider: "google",
        providerId: sub,
      });
    }

    if (user.provider === "local") {
      return res.status(400).json({
        message: "Please login using email and password",
      });
    }

    const myToken = jwt.sign(
      { id: user._id },
        JWT_SECRET
    );

    res.json({
      token: myToken
    });

  } catch (err) {
    res.status(500).json({ message: "Google login failed" });
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

app.post("/creategroup", async (req, res) => {
    const userid = req.body.userid;
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
        currentUser.groups.push({
            Gid: groupid,
            Gname: name
        });
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
                friend.groups.push({
                    Gid: groupid,
                    Gname: name
                });

            }
            else {
                friend = await UserModel.create({
                    name: members[i].name,
                    email: members[i].email,
                    isdummy: true
                })
                friend.groups.push({
                    Gid: groupid,
                    Gname: name
                });
            }
            await friend.save();
            membersid.push(friend._id);
            availablemembers.push({
                userid: friend._id,
                name: friend.name,
                email: friend.email
            });
        }

        for (let i = 0; i < availablemembers.length; i++) {
            const userA = availablemembers[i];
            const dbUserA = await UserModel.findById(userA.userid);

            for (let j = 0; j < availablemembers.length; j++) {
                if (i === j) continue;

                const userB = availablemembers[j];


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

app.post("/CreateFriend", async (req, res) => {
    const userid = req.body.userid;
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
                error: "Already Friend"
            });
        }
        res.status(200).json({
            message: "Friend added successfully",
            friendid: friend._id
        });
    }
    catch (e) {
        res.status(500).send({
            error: "Backend error"
        })
    }
})

app.post("/CreatefriendsExpense", async (req, res) => {

    for (let attempt = 0; attempt < 3; attempt++) {

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const { userid, paidby, description, splitBetween } = req.body;
            let amount = parseInt(req.body.amount);

            const paiduser = await UserModel.findById(paidby).session(session);
            if (!paiduser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Paid user not found" });
            }

            for (let i = 0; i < splitBetween.length; i++) {

                if (paidby != splitBetween[i].userId) {

                    const current = await UserModel
                        .findById(splitBetween[i].userId)
                        .session(session);

                    const share = parseInt(splitBetween[i].share);

                    const friendIndex = paiduser.friends.findIndex(f =>
                        f.userId.toString() === splitBetween[i].userId.toString()
                    );

                    paiduser.friends[friendIndex].personalBalance += share;

                    const paiduserIndex = current.friends.findIndex(f =>
                        f.userId.toString() === paidby.toString()
                    );

                    current.friends[paiduserIndex].personalBalance -= share;

                    await current.save({ session });
                }
            }

            await paiduser.save({ session });

            await ExpenseModel.create([{
                createdby: userid,
                groupId: null,
                paidBy: paidby,
                amount,
                description,
                splitBetween
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Expense created successfully"
            });

        } catch (e) {

            await session.abortTransaction();
            session.endSession();

            if (e.code === 112 && attempt < 2) {
                continue; // retry
            }

            console.error(e);
            return res.status(500).json({
                message: "Backend error"
            });
        }
    }

    return res.status(500).json({
        message: "Too much concurrency, try again"
    });
});

app.post("/CreategroupExpense", async (req, res) => {

    for (let attempt = 0; attempt < 3; attempt++) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const userid = req.body.userid;
            const groupid = req.body.groupid;
            const paidby = req.body.paidby;
            let amount = req.body.amount;
            amount = parseInt(amount);
            const description = req.body.description;
            const splitBetween = req.body.splitBetween;


            const group = await GroupModel.findById(groupid).session(session);;
            if (!group) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Group not found" });
            }

            for (let i = 0; i < splitBetween.length; i++) {
                const memberId = splitBetween[i].userId;
                const share = parseInt(splitBetween[i].share);

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

            await group.save({ session });

            await ExpenseModel.create([{
                createdby: userid,
                groupId: groupid,
                paidBy: paidby,
                amount: amount,
                description: description,
                splitBetween: splitBetween
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({ message: "Group expense added successfully" });

        } catch (e) {
            await session.abortTransaction();
            session.endSession();
            if (e.code === 112 && attempt < 2) {
                continue;
            }

            console.error(e);
            return res.status(500).send({ message: "Backend error" });
        }
    }
    return res.status(500).json({ message: "Too much concurrency, try again" });
});

app.post("/CreatefriendsSettlement", async (req, res) => {

    for (let attempt = 0; attempt < 3; attempt++) {

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const { userid, friendid } = req.body;
            let amount = parseInt(req.body.amount);

            if (!amount || amount <= 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "Invalid amount" });
            }

            const user = await UserModel.findById(userid).session(session);
            const friend = await UserModel.findById(friendid).session(session);

            if (!user || !friend) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "User not found" });
            }

            let friendIndex = user.friends.findIndex(
                f => f.userId.toString() === friendid.toString()
            );

            if (friendIndex !== -1) {
                user.friends[friendIndex].personalBalance += amount;
            }

            let userIndex = friend.friends.findIndex(
                f => f.userId.toString() === userid.toString()
            );

            if (userIndex !== -1) {
                friend.friends[userIndex].personalBalance -= amount;
            }

            await user.save({ session });
            await friend.save({ session });

            await SettlementModel.create([{
                groupId: null,
                from: userid,
                to: friendid,
                amount
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Settlement created successfully"
            });

        } catch (e) {

            await session.abortTransaction();
            session.endSession();

            if (e.code === 112 && attempt < 2) {
                continue; // retry
            }

            console.error(e);
            return res.status(500).json({
                message: "Backend error"
            });
        }
    }

    return res.status(500).json({
        message: "Too much concurrency, try again"
    });
});

app.post("/CreategroupSettlement", async (req, res) => {

    for (let attempt = 0; attempt < 3; attempt++) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const userid = req.body.userid;
            const groupid = req.body.groupid;
            const friendid = req.body.friendid;
            let amount = req.body.amount;
            amount = parseInt(amount);


            const group = await GroupModel.findById(groupid).session(session);

            if (!group) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Group not found" });
            }

            let existingIndex = group.balances.findIndex(b =>
                b.from.toString() === userid.toString() && b.to.toString() === friendid.toString()
            );
            if (existingIndex != -1) {
                if (group.balances[existingIndex].amount > amount) {
                    group.balances[existingIndex].amount -= amount;
                }

                else if (group.balances[existingIndex].amount < amount) {
                    let existingamount = group.balances[existingIndex].amount;
                    group.balances.splice(existingIndex, 1);
                    group.balances.push({
                        from: friendid,
                        to: userid,
                        amount: amount - existingamount
                    });
                }
                else {
                    group.balances.splice(existingIndex, 1);
                }
            }
            else {
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

            await group.save({ session });

            await SettlementModel.create([{
                groupId: groupid,
                from: userid,
                to: friendid,
                amount
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).send({
                message: "Settlement created successfully"
            })
        } catch (e) {
            await session.abortTransaction();
            session.endSession();

            if (e.code === 112 && attempt < 2) {
                continue; // retry
            }

            console.error(e);
            return res.status(500).json({
                message: "Backend error"
            });
        }
    }
    return res.status(500).json({
        message: "Too much concurrency, try again"
    })
});
app.get("/auth", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token not provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const info = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({
            message: "Token is valid",
            userid: info.id
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
});

app.get("/Groups", async (req, res) => {
    const userid = req.headers.userid;
    try {
        const user = await UserModel.findById(userid);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const groups = user.groups.reverse();

        res.json({ groups });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
})

app.get("/GroupInfo", async (req, res) => {
    const groupid = req.headers.groupid;
    const userid = req.headers.userid;

    try {
        const currentUser = await UserModel.findById(userid).lean();
        const group = await GroupModel.findById(groupid).lean();

        if (!group || !currentUser) {
            return res.status(404).json({ message: "User or Group not found" });
        }


        const idToName = {};
        currentUser.friends.forEach(friend => {
            idToName[friend.userId.toString()] = friend.name;
        });
        idToName[userid.toString()] = "You";

        const membersInfo = group.members.map(id => ({
            id: id,
            name: idToName[id.toString()] || "Unknown"
        }));



        const readableBalances = group.balances.map(b => ({
            from: {
                id: b.from,
                name: idToName[b.from.toString()] || "Unknown"
            },
            to: {
                id: b.to,
                name: idToName[b.to.toString()] || "Unknown"
            },
            amount: b.amount
        }));


        res.json({
            members: membersInfo,
            balances: readableBalances
        });

    } catch (error) {
        console.error("Error in /GroupInfo:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

app.get("/friendInfo", async (req, res) => {
    const userid = req.headers.userid;
    const friendid = req.headers.friendid;
    try {
        const user = await UserModel.findById(userid);

        let friend = user.friends.find(f => f.userId.toString() === friendid.toString());

        res.status(200).send({
            friend: friend
        })
    } catch (error) {
        console.error("Error in /GroupInfo:", error);
        res.status(500).json({ message: "Server error", error });
    }
})

app.get("/Grouptransac", async (req, res) => {
    const groupid = req.headers.groupid;
    try {
        const Expense = await ExpenseModel.find({
            groupId: groupid
        }).sort({ date: -1 }).lean();
        const Settlement = await SettlementModel.find({
            groupId: groupid
        }).sort({ date: -1 }).lean();
        res.status(200).json({
            Expense,
            Settlement
        })
    } catch (err) {
        res.status(500).send({
            message: "Server error", err
        })
    }
})

app.get("/Friendtransac", async (req, res) => {
    const userid = req.headers.userid;
    const friendid = req.headers.friendid;
    try {
        const expenses = await ExpenseModel.find({
            groupId: null,
            splitBetween: {
                $all: [
                    { $elemMatch: { userId: userid } },
                    { $elemMatch: { userId: friendid } }
                ]
            }
        }).sort({ date: -1 }).lean();
        const settlement1 = await SettlementModel.find({
            groupId: null,
            from: userid,
            to: friendid
        });
        const settlement2 = await SettlementModel.find({
            groupId: null,
            from: friendid,
            to: userid
        });

        const settlements = [...settlement1, ...settlement2].sort((a, b) => b.date - a.date);

        res.status(200).json({
            expenses,
            settlements
        })
    } catch (err) {
        res.status(500).send({
            message: "Server error", err
        })
    }
})

app.get("/Usertransac", async (req, res) => {
    const userid = req.headers.userid;
    try {
        const expenses = await ExpenseModel.find({
            createdby: userid
        }).sort({ date: -1 }).lean();

        const settlements = await SettlementModel.find({
            from: userid
        }).sort({ date: -1 }).lean();

        res.status(200).json({
            expenses,
            settlements
        })
    } catch (err) {
        res.status(500).send({
            message: "Server error", err
        })
    }
})

app.get("/Friends", async (req, res) => {
    const userid = req.headers.userid;
    try {
        const user = await UserModel.findById(userid);
        if (!user)
            res.status(400).send({ message: "user does not exist" });
        const AllFriends = user.friends;
        const Unsettled = AllFriends.filter(friend => friend.personalBalance !== 0).reverse();
        const Settled = AllFriends.filter(friend => friend.personalBalance === 0).reverse();
        res.status(200).send({
            AllFriends,
            Unsettled,
            Settled
        })
    } catch (err) {
        res.status(500).send({
            message: "Server error", err
        })
    }
})


app.listen(PORT);