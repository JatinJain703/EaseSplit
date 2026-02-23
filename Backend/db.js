const mongoose = require("mongoose");
const schema = mongoose.Schema;
const objectId = schema.Types.ObjectId;

const User = new schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    provider: { type: String, default: "local" },
    providerId: String,
    isdummy:{type:Boolean,default:false},
    friends: [
        {
            userId: {type:objectId,unique:true},
            name: String,
            email: String,
           personalBalance: { type: Number, default: 0 } 
        }
    ],
    groups: [
        {
            Gid:{type:objectId,unique:true},
            Gname:String
        }
    ]
})

const OTP=new schema({
    id:objectId,
   otp: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 
  }
})

const Groups = new schema({
    name: String,
    members: [objectId],
    balances: [
        {
            from: objectId,  //who gives
            to: objectId,    //receiver
            amount: Number
        }
    ]
})

const Expenses = new schema({
    createdby:objectId,
    groupId: objectId,
    paidBy: objectId,
    amount: Number,
    description: String,
    splitBetween: [
        { userId: objectId, share: Number }
    ],
    date: { type: Date, default: Date.now }
})

const Settlement = new schema({
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
const OTPModel=mongoose.model('OTP',OTP);
module.exports={
    UserModel,
    OTPModel,
    GroupModel,
    ExpenseModel,
    SettlementModel
}