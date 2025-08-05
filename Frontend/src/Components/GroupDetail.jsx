import { Header } from "./Header";
import { Footer } from "./Footer";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AddExpense } from "./AddExpense";
import { Settleup } from "./Settleup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function GroupDetail() {
  const location = useLocation();
  const group = location.state;
  const [members, setmembers] = useState([]);
  const [balances, setbalances] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showExpenseBox, setShowExpenseBox] = useState(false);
  const [showSettleup, setshowSettleup] = useState(false);
  const navigate = useNavigate();
  async function fetchgroupinfo() {
    try {
      const response = await axios.get("https://easesplit.onrender.com/GroupInfo", {
        headers: {
          userid: localStorage.getItem("userid"),
          groupid: group.Gid
        },
      });
      return response.data || [];
    } catch (err) {
      console.error("Failed to fetch groups info", err);
      return [];
    }
  }

  async function fetchData() {
    const data = await fetchgroupinfo();
    setmembers(data.members);
    setbalances(data.balances);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (expenseData) => {
    try {
      await axios.post("https://easesplit.onrender.com/CreategroupExpense", {
        userid: localStorage.getItem("userid"),
        groupid: group.Gid,
        paidby: expenseData.paidBy,
        amount: expenseData.amount,
        description: expenseData.description,
        splitBetween: expenseData.splitBetween
      })

      await fetchData();
    } catch (err) {
      console.log(err);
    }
  };
  const handleSettleup = async (SettleData) => {
    try {
      await axios.post("https://easesplit.onrender.com/CreategroupSettlement", {
        userid: localStorage.getItem("userid"),
        groupid: group.Gid,
        friendid: SettleData.to,
        amount: SettleData.amount
      })

      await fetchData();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">

      <Header />


      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl border border-slate-200 flex flex-col relative">

          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-100">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{group.Gname}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowExpenseBox(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                Add Expense
              </button>
              <button onClick={() => setshowSettleup(true)} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
                Settle Up
              </button>
            </div>
          </div>


          <div className="flex-grow flex flex-col px-6 py-8 overflow-auto relative">

            <div className="absolute top-3 right-2 w-32 z-10">
              <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-800">Members ({members.length})</span>
                  <svg
                    className={`w-3 h-3 text-gray-600 transition-transform ${showMembers ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMembers && (
                  <div className="px-2 pb-2 space-y-1 max-h-32 overflow-y-auto">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 truncate"
                        title={member.name}
                      >
                        {member.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {balances.length > 0 ? (
              <div className="space-y-4 mb-6 ">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Group Balances</h2>
                {balances.map((balance, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-200 text-left">
                    <span className="text-gray-700">
                      <span className="font-semibold text-blue-800">{balance.from.name}</span> owes{" "}
                      <span className="font-semibold text-red-600">₹{balance.amount}</span> to{" "}
                      <span className="font-semibold text-blue-800">{balance.to.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-green-600 font-semibold text-xl text-center mb-6 mt-10">
                This group is all settled up! 🎉
              </div>
            )}


            <div className="text-center mt-auto">
              <button
                onClick={() => navigate(`/group/${group.Gname}/transactions`, {
                  state: {
                    group,
                    members,
                  }
                })}
                className="text-blue-600 hover:underline text-sm font-medium">See all transactions</button>
            </div>
          </div>
        </div>
      </main>


      <Footer />
      {showExpenseBox && (
        <AddExpense
          onClose={() => setShowExpenseBox(false)}
          onSubmit={handleAddExpense}
          title={`Add Expense in ${group.Gname}`}
          members={members}
        />
      )}
      {
        showSettleup && (
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