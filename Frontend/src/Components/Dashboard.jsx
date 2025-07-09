import { authSelector } from "../atoms/atom";
import { useRecoilValueLoadable, useRecoilRefresher_UNSTABLE } from "recoil";
import { Navigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
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

export function Mainpage() {
    const [unsettledFriends, setUnsettledFriends] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        async function fetchData() {
            const friends = await fetchUnsettledFriends();
            setUnsettledFriends(friends);
        }
        fetchData();
    }, []);

    return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      
      <Header />

      
      <main className="flex-1 bg-slate-100 flex justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col">
          
          <div className="flex-grow flex flex-col items-center justify-start px-6 py-8 overflow-auto">
            {unsettledFriends.length === 0 ? (
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700 text-center">
                You're all settled up. <br className="block md:hidden" /> Awesome! 🎉
              </h2>
            ) : (
              <div className="w-full space-y-4">
                {unsettledFriends.map((friend) => (
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

     
      <Footer />
    </div>
  )}
