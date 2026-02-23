import { signup as signupAtom, authSelector } from "../atoms/atom";
import { useSetRecoilState, useRecoilRefresher_UNSTABLE } from "recoil";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
export function Signup() {
    const setsignup = useSetRecoilState(signupAtom);
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const refreshAuth = useRecoilRefresher_UNSTABLE(authSelector);
    const navigate = useNavigate();
    async function handlesubmit(e) {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        if (!email.trim()) {
            toast.error("Email cannot be empty");
            return;
        }

        if (!password.trim()) {
            toast.error("Password cannot be empty");
            return;
        }


        try {
            const response = await axios.post("https://easesplit.onrender.com/signup", {
                name,
                email,
                password
            });


            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                toast.success("Signup successful!");
                refreshAuth();
                navigate("/Dashboard");
            } else if (response.data.message) {
                toast.error(response.data.message);
            } else {
                toast.error("Unexpected response from server.");
            }
        } catch (error) {

            toast.error(error.response?.data?.message || "Signup failed!");
        }


    }

    return (

        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-10">
            <h2 className="text-2xl text-center font-bold mb-10">Sign Up</h2>
            <form className="space-y-4">
                <ToastContainer position="top-center" autoClose={3000} />
                <input
                    type="text"
                    placeholder="Name"
                    onChange={(e) => setname(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setemail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setpassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <label className="flex items-center text-sm">
                    <input type="checkbox"
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mr-2"
                    />
                    Remember me
                </label>
                <button
                    type="submit"
                    onClick={(e) => handlesubmit(e)}
                    disabled={!agreed}
                    className="w-full bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 transition"
                >
                    Sign Up
                </button>
            </form>

            <div className="my-4 text-center text-gray-400">Or with</div>
            <div className="flex gap-4">
                <div className="flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {

                            const res = await axios.post(
                                "https://easesplit.onrender.com/oauth/google",
                                {
                                    token: credentialResponse.credential,
                                }
                            );

                            localStorage.setItem("token", res.data.token);
                            refreshAuth();
                            navigate("/Dashboard");
                        }}
                        onError={() => {
                            console.log("Login Failed");
                        }}
                    />

                </div>
            </div>

            <div className="mt-6 text-sm text-center text-gray-500">
                <span>Already have an account? </span>
                <button
                    onClick={() => setsignup((signup) => !signup)}
                    className="text-blue-600 hover:underline ml-1"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
