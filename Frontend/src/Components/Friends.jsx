import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
async function fetchUnsettledFriends() {
    try {
        const response = await axios.get("http://localhost:3000/Unsettledfriends", {
            headers: {
                userid: localStorage.getItem("userid")
            },
        });
        return response.data.unsettledFriends || [];
    } catch (err) {
        console.error("Failed to fetch unsettled friends", err);
        return [];
    }
}

async function fetchsettledfriends() {
    try {
        const response = await axios.get("http://localhost:3000/Settledfriends", {
            headers: {
                userid: localStorage.getItem("userid")
            },
        });
        return response.data.settledFriends || [];
    } catch (err) {
        console.error("Failed to fetch settled friends", err);
        return [];
    }
}
export function Friends() {
    const [unsettledFriends, setUnsettledFriends] = useState([]);
    const [settledFriends, setsettledFriends] = useState([]);
    const navigate=useNavigate();
    const fetchsettled = async () => {
        const settled = await fetchsettledfriends();
        setsettledFriends(settled);
    }
    useEffect(() => {
        async function fetchData() {
            const friends = await fetchUnsettledFriends();
            setUnsettledFriends(friends);
        }
        fetchData();
    }, []);

    return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      
      <Header />

     
      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          
          <div className="flex-grow flex flex-col px-6 py-8 overflow-auto">
            <div className="space-y-6">
              
              {unsettledFriends.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Unsettled Friends</h2>
                  <div className="space-y-4">
                    {unsettledFriends.map((friend) => (
                      <button
                        key={friend.userId}
                        onClick={() => navigate(`/friend/${friend.name}`, { state: friend })}
                        className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition-all"
                      >
                        <div className="text-lg font-semibold text-blue-800">{friend.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {friend.personalBalance > 0 ? (
                            <span>
                              You owe <span className="font-semibold text-red-500">₹{friend.personalBalance}</span> to{" "}
                              {friend.name}
                            </span>
                          ) : (
                            <span>
                              You lent{" "}
                              <span className="font-semibold text-green-500">₹{Math.abs(friend.personalBalance)}</span>{" "}
                              to {friend.name}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              
              <div className="text-center">
                <button
                  onClick={fetchsettled}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition"
                >
                  Show Settled Friends
                </button>
              </div>

             
              {settledFriends.length > 0 && (
                <div className="space-y-4">
                  {settledFriends.map((friend) => (
                    <button
                      key={friend.userId}
                      onClick={() => navigate(`/friend/${friend.name}`, { state: friend })}
                      className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-lg font-semibold text-green-700">{friend.name}</div>
                      <div className="text-sm text-gray-500">You're all settled up!</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

     
      <Footer />
    </div>
  )
}