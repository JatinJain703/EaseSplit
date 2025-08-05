import { Header } from "./Header"
import { Footer } from "./Footer"
import { useNavigate } from "react-router-dom"
import { authSelector } from "../atoms/atom"
import { useRecoilRefresher_UNSTABLE } from "recoil"
export function MyAcc() {
  const navigate = useNavigate()
  const refreshauth=useRecoilRefresher_UNSTABLE(authSelector);
  const handleLogout = () => {
    localStorage.removeItem("userid")
    localStorage.removeItem("token")
    refreshauth();
    navigate("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <main className="flex-1 flex justify-center items-center px-4 py-6">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
        >
          Logout
        </button>
      </main>

      <Footer />
    </div>
  )
}
