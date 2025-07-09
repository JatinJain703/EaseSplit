import { useState,useEffect } from "react";
import axios from "axios";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate } from "react-router-dom";
async function fetchgroups() {
     try {
        const response = await axios.get("http://localhost:3000/Groups", {
            headers: {
                userid: localStorage.getItem("userid")
            },
        });
        return response.data.groups || [];
    } catch (err) {
        console.error("Failed to fetch Groups", err);
        return [];
    }
}
export function Groups()
{
  const navigate=useNavigate();
    const [groups,setgroups]=useState([]);
    useEffect(()=>{
      async function fetchData()
      {
        const data=await fetchgroups();
        setgroups(data);
      }
      fetchData();
    },[])

    return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      
      <Header />

      
      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          
          <div className="flex-grow flex flex-col px-6 py-8 overflow-auto">
            <div className="space-y-6">
              {groups.length > 0 ? (
                <div>
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <button
                        key={group.Gid}
                        className="w-full text-left bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition-all"
                        onClick={() => navigate(`/group/${group.Gname}`, { state: group})}
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

      
      <Footer />
    </div>
  )
}