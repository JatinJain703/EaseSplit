const mongoose = require("mongoose");
const schema = require("schema");
const objectId = schema.Types.ObjectId;

const User = new schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    friends: [
        {
            userId: objectId,
            name: String,
            email: String,
            personalBalance: Number  // ✅ This is only for non-group expenses
        }
    ],
    groups: [objectId]
})

const Groups = new schema({
    name: String,
    members: [objectId],
    balances: [
        {
            from: objectId,  // who owes
            to: objectId,    // who is owed
            amount: Number
        }
    ]
})

const Expenses = ({
    groupId: objectId,
    paidBy: objectId,
    amount: Number,
    description: String,
    splitBetween: [
        { userId: objectId, share: Number }
    ],
    date: { type: Date, default: Date.now }
})

const Settlement = ({
    groupId: objectId,
    from: objectId,      // who paid
    to: objectId,        // who received
    amount: Number,
    date: { type: Date, default: Date.now }
})

const UserModel=mongoose.model('User',User);
const GroupModel=mongoose.model('Groups',Groups);
const ExpenseModel=mongoose.model('Expenses',Expenses);
const SettlementModel=mongoose.model('Settlement',Settlement);
module.exports={
    UserModel,
    GroupModel,
    ExpenseModel,
    SettlementModel
}