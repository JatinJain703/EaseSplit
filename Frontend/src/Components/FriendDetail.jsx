import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AddExpense } from "./AddExpense";
import { useState } from "react";
import { Settleup } from "./Settleup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export function FriendDetail() {
    const location = useLocation();
    const initialfriend = location.state;
    const[friend,setfriend]=useState(initialfriend);
    const [showExpenseBox, setShowExpenseBox] = useState(false);
    const [showSettleup,setshowSettleup]=useState(false);
   const navigate=useNavigate();

    const fetchFriendInfo = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/friendInfo`, {
      headers: {
        userid: localStorage.getItem("userid"),
        friendid: initialfriend.userId,
      }
    });
    setfriend(res.data.friend);
  } catch (err) {
    console.error("Failed to fetch friend info", err);
  }
};

    const members=[
      {
        id:localStorage.getItem("userid"),
        name:"You"
      },
      {
        id:friend.userId,
        name:friend.name
      }
    ]
    
    const handleAddExpense = async (expenseData) => {
    try{
      await axios.post("http://localhost:3000/CreatefriendsExpense",{
        userid:localStorage.getItem("userid"),
        paidby:expenseData.paidBy,
        amount:expenseData.amount,
        description:expenseData.description,
        splitBetween:expenseData.splitBetween
      })

      await fetchFriendInfo();
    }catch(err)
    {
      console.log(err);
    }
  };
  const handleSettleup = async (SettleData) => {
    try{
      await axios.post("http://localhost:3000/CreatefriendsSettlement",{
        userid:localStorage.getItem("userid"),
        friendid:SettleData.to,
        amount:SettleData.amount
      })

      await fetchFriendInfo();
    }catch(err)
    {
      console.log(err);
    }
  };
     return (
    <div className="min-h-screen flex flex-col bg-slate-100">
     
      <Header />

      
      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl border border-slate-200 flex flex-col">
         
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-100">
            <div>
              <h1 className="text-xl font-bold text-blue-800">{friend.name}</h1>
              <p className="text-sm text-gray-600">{friend.email}</p>
            </div>
            <div className="flex gap-2">
              <button  onClick={() => setShowExpenseBox(true)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition">
                Add Expense
              </button>
              <button  onClick={() => setshowSettleup(true)} className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg shadow hover:bg-green-700 transition">
                Settle Up
              </button>
            </div>
          </div>

          <div className="flex-grow flex items-start justify-center px-6 py-12">
            {friend.personalBalance === 0 ? (
              <p className="text-green-600 font-semibold text-xl text-center">
                You're all settled up with <span className="font-bold">{friend.name}</span>!
              </p>
            ) : friend.personalBalance > 0 ? (
              <p className="text-red-600 font-semibold text-xl text-center">
                You owe <span className="font-bold">₹{friend.personalBalance}</span> to{" "}
                <span className="font-bold">{friend.name}</span>.
              </p>
            ) : (
              <p className="text-green-600 font-semibold text-xl text-center">
                You lent <span className="font-bold">₹{Math.abs(friend.personalBalance)}</span> to{" "}
                <span className="font-bold">{friend.name}</span>.
              </p>
            )}
          </div>

         
          <div className="text-center py-4 border-t border-gray-100">
            <button 
            onClick={() => navigate(`/friend/${friend.name}/transactions`, { state: friend })}
            className="text-blue-600 text-sm font-semibold hover:underline">
              Show all settled transactions
            </button>
          </div>
        </div>
      </main>

      
      <Footer />
        {showExpenseBox && (
        <AddExpense
          onClose={() => setShowExpenseBox(false)}
          onSubmit={handleAddExpense}
          title={`Add Expense with ${friend.name}`}
          members={members}
        />
      )}
      {
        showSettleup&&(
          <Settleup 
            onClose={() => setshowSettleup(false)}
           onSubmit={handleSettleup}
           members={members}
           />
        )
      }
    </div>
  )
}