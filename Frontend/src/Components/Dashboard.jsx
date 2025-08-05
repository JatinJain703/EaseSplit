import { authSelector,FriendsAtom } from "../atoms/atom";
import { useRecoilValueLoadable, useRecoilRefresher_UNSTABLE, useRecoilState, useSetRecoilState } from "recoil";
import { Navigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Addfriend } from "./Addfriend";
import { Addgroup } from "./Addgroup";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { usegetFriends } from "../hooks/usegetFriends";

export function Dashboard() {
    const auth = useRecoilValueLoadable(authSelector);
    const refreshAuth = useRecoilRefresher_UNSTABLE(authSelector);

    const handlelogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
        refreshAuth();
    };

    if (auth.state === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <TailSpin
                    height={80}
                    width={80}
                    color="#3b82f6"
                    ariaLabel="loading-spinner"
                    radius="1"
                    visible={true}
                />
            </div>
        );
    }

    if (auth.state === "hasError") {
        return <div>Error occurred</div>;
    }

    if (!auth.contents) {
        return <Navigate to="/" />;
    }

    return (
        <>
            <Mainpage />
        </>
    );
}




async function handleAddfriend(Friend)
{
  try{
    const response=await axios.post("https://easesplit.onrender.com/CreateFriend",{
      userid:localStorage.getItem("userid"),
      name:Friend.name,
      email:Friend.email
    })
    if(response.data.message)
    {
      toast.success(response.data.message)
    }
    else if(response.data.error)
    {
      toast.error(response.data.error)
    }
  }catch (err) {
        toast.error("Failed to add friend");
    }
}

async function  handleAddgroup(group) {
  try{
    const response=await axios.post("https://easesplit.onrender.com/creategroup",{
      userid:localStorage.getItem("userid"),
      name:group.name,
      members:group.members
    })
    if(response.data.message)
    {
      toast.success(response.data.message)
    }
    else if(response.data.error)
    {
      toast.error(response.data.error)
    }
  }catch (err) {
        toast.error("Failed to add friend");
    }
}
export function Mainpage() {
    const [Friends,setFriends]=useRecoilState(FriendsAtom);
    const [showAddfriend,setshowAddfriend]=useState(false);
    const [showAddgroup,setshowAddgroup]=useState(false);
    const navigate = useNavigate();
    const fetchFriends=usegetFriends();

     useEffect(()=>{
      fetchFriends();
    },[])

     return (
    <div className="h-screen flex flex-col bg-blue-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <Header />
      <main className="flex-1 bg-slate-100 flex justify-center px-4 py-6 overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          <div className="bg-blue-100 px-6 py-4 border-b border-blue-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-800">Dashboard</h2>
              <div className="flex gap-2">
                <button
                 onClick={()=>{setshowAddfriend(true)}}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Add Friend
                </button>
                <button
                   onClick={()=>{setshowAddgroup(true)}}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  Add Group
                </button>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center justify-start px-6 py-8 overflow-auto">
            {Friends.Unsettled.length === 0 ? (
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700 text-center">
                You're all settled up. <br className="block md:hidden" /> Awesome! 🎉
              </h2>
            ) : (
              <div className="w-full space-y-4">
                {Friends.Unsettled.map((friend) => (
                  <button
                    key={friend.userId}
                    onClick={() => navigate(`/friend/${friend.name}`, { state: friend })}
                    className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition"
                  >
                    <div className="text-lg font-semibold text-blue-800">{friend.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {friend.personalBalance > 0 ? (
                        <>
                          You owe ₹{friend.personalBalance} to {friend.name}
                        </>
                      ) : (
                        <>
                          You lent ₹{Math.abs(friend.personalBalance)} to {friend.name}
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
       {
        showAddfriend&&<Addfriend 
        onclose={()=>setshowAddfriend(false)}
        onsubmit={handleAddfriend}>
        </Addfriend>
      }
      {
        showAddgroup&&<Addgroup 
        onclose={()=>setshowAddgroup(false)}
        onsubmit={handleAddgroup}>
        </Addgroup>
      }
      <Footer />
    </div>
  )
}
