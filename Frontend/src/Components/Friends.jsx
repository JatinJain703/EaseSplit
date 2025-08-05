import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Addfriend } from "./Addfriend";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRecoilValue } from "recoil";
import { FriendsAtom } from "../atoms/atom";
import { usegetFriends } from "../hooks/usegetFriends";
import axios from "axios";

export function Friends() {
  const Friend = useRecoilValue(FriendsAtom);
  const fetchFriends=usegetFriends();
  const [showAddfriend, setshowAddfriend] = useState(false);
  const navigate = useNavigate();

  async function handleAddfriend(Friend) {
  try {
    const response = await axios.post("https://easesplit.onrender.com/CreateFriend", {
      userid: localStorage.getItem("userid"),
      name: Friend.name,
      email: Friend.email
    })
    if (response.data.message) {
      toast.success(response.data.message)
      await fetchFriends();
    }
    else if (response.data.error) {
      toast.error(response.data.error)
    }
  } catch (err) {
    toast.error("Failed to add friend");
  }
}

  return (

    <div className="h-screen flex flex-col bg-slate-100">
      <ToastContainer position="top-center" autoClose={3000} />
      <Header />
      <main className="flex-1 flex justify-center px-4 py-6 overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          <div className="bg-blue-100 px-6 py-4 border-b border-blue-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-800">Friends</h2>
              <button
                onClick={() => { setshowAddfriend(true) }}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Add Friend
              </button>
            </div>
          </div>

          <div className="flex-grow flex flex-col px-6 py-8 overflow-auto">
            <div className="space-y-6">
              {Friend.Unsettled.length > 0 && (
                <div>
                  <h2 className="text-xl text-center font-bold text-gray-800 mb-2">Unsettled Friends</h2>
                  <div className="space-y-4">
                    {Friend.Unsettled.map((friend) => (
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


              {Friend.Settled.length > 0 && (
                <div>
                  <h2 className="text-xl text-center font-bold text-gray-800 mb-2">Settled Friends</h2>
                  <div className="space-y-4">
                    {Friend.Settled.map((friend) => (
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
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      {
        showAddfriend && <Addfriend
          onclose={() => setshowAddfriend(false)}
          onsubmit={handleAddfriend}>
        </Addfriend>
      }
      <Footer />
    </div>
  )
}