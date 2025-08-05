import { signup as signupAtom,authSelector} from "../atoms/atom";
import { useSetRecoilState,useRecoilState, useRecoilValue,useRecoilRefresher_UNSTABLE } from "recoil";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { otpgeneratedAtom,otpAtom} from "../atoms/atom";
import { Otp } from "./otp";
import { useNavigate } from "react-router-dom";
export function Login() {
   const setsignup=useSetRecoilState(signupAtom);
   const [otpgenerated,setotpgenerated]=useRecoilState(otpgeneratedAtom);
   const [otp,setotp]=useRecoilState(otpAtom);

    const [repeatpass,setrepeatpass]=useState("");
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const refreshAuth = useRecoilRefresher_UNSTABLE(authSelector);
    const navigate=useNavigate();
   async function handlesubmit(e) {
  e.preventDefault(); 
  
  

  if (!email.trim()) {
    toast.error("Email cannot be empty");
    return;
  }

  if (!password.trim()) {
    toast.error("Password cannot be empty");
    return;
  }

 if (!repeatpass.trim()) {
    toast.error("Repeat password cannot be empty");
    return;
  }

  if(password!=repeatpass)
  {
     toast.error("Password and repeated password must be same");
    return;
  }
  
   try {
    const response = await axios.post("https://easesplit.onrender.com/login", {
      email,
      password
    });

   
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      toast.success("OTP send to your mail");
      setotpgenerated(c=>!c);
    } else if (response.data.message) {
      toast.error(response.data.message);
    } else {
      toast.error("Unexpected response from server.");
    }
  } catch (error) {
    
    toast.error(error.response?.data?.message || "Signup failed!");
  }

}
 async function submit(e)
 {
    e.preventDefault();
     
    for(let i=0;i<6;i++)
     {
      if(otp[i]=="")
      {
        toast.error("Please Enter Valid OTP");
    return;
      }
     }
    const token=localStorage.getItem("token");
    try{
  const response = await axios.post("https://easesplit.onrender.com/otp", {
      token,
      otp: otp.join("") 
    });

   
    if (response.data.token) {
      localStorage.removeItem("token");
      localStorage.setItem("token", response.data.token);
      toast.success("Login Successfully");
      setotpgenerated(o=>!o);
      setotp(Array(6).fill(""));
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
          <ToastContainer position="top-center" autoClose={3000} />
        <h2 className="text-2xl text-center font-bold mb-10 ">Login</h2>

        <form className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            onChange={(e)=>setemail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e)=>setpassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Repeat Password"
            onChange={(e)=>setrepeatpass(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 "
          />
         <div>
          {otpgenerated&&<Otp email={email} password={password}/>}
         </div>
         { !otpgenerated?<button
            type="submit"
            onClick={(e)=>handlesubmit(e)}
            className="w-full bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 transition"
          >
            Generate OTP
          </button>:
          <button
            type="submit"
            onClick={(e)=>submit(e)}
            className="w-full bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
          }
        </form>

        <div className="my-4 text-center text-gray-400">Or with</div>
        <div className="flex gap-4">
          <button className="flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="h-5 w-5"
              alt="Google"
            />
            Google
          </button>
          <button className="flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCvh-j7HsTHJ8ZckknAoiZMx9VcFmsFkv72g&s"
              className="h-5 w-5"
              alt="Apple"
            />
            Apple
          </button>
        </div>

       <div className="mt-6 text-sm text-center text-gray-500">
  <span>Dont have an account? </span>
  <button
    onClick={() => setsignup((signup) => !signup)}
    className="text-blue-600 hover:underline ml-1"
  >
    Sign Up
  </button>
</div>
   </div>
  );
}
