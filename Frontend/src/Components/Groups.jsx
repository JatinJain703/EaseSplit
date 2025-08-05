import { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate } from "react-router-dom";
import { Addgroup } from "./Addgroup";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { usegetFriends } from "../hooks/usegetFriends";
 import { usegetGroups } from "../hooks/usegetGroups";
import { GroupAtom } from "../atoms/atom";
import { useRecoilValue } from "recoil";

export function Groups() {
  const navigate = useNavigate();
  const Groups= useRecoilValue(GroupAtom);
  const [showAddgroup, setshowAddgroup] = useState(false);
  const fetchFriends=usegetFriends();
  const fetchGroups=usegetGroups();

  useEffect(() => {
    fetchGroups();
  }, [])


  async function handleAddgroup(group) {
 
  try {
    const response = await axios.post("https://easesplit.onrender.com/creategroup", {
      userid: localStorage.getItem("userid"),
      name: group.name,
      members: group.members
    })
    if (response.data.message) {
      toast.success(response.data.message)
      await fetchGroups();
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

      <Header />


      <main className="flex-1 flex justify-center px-4 py-6 overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          <div className="bg-blue-100 px-6 py-4 border-b border-blue-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-800">Groups</h2>
              <button
                onClick={() => { setshowAddgroup(true) }}
                className="px-3 py-2 bg-green-600  text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Add Group
              </button>
            </div>
          </div>
          <div className="flex-grow flex flex-col px-6 py-8 overflow-auto">
            <div className="space-y-6">
              {Groups.length > 0 ? (
                <div>
                  <div className="space-y-4">
                    {Groups.map((group) => (
                      <button
                        key={group.Gid}
                        className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition-all"
                        onClick={() => navigate(`/group/${group.Gname}`, { state: group })}
                      >
                        <div className="text-lg font-semibold text-blue-800">{group.Gname}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">No groups found. Create your first group to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {
        showAddgroup && <Addgroup
          onclose={() => setshowAddgroup(false)}
          onsubmit={handleAddgroup}>
        </Addgroup>
      }

      <Footer />
    </div>
  )
}