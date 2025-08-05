import { useEffect, useRef, useState } from "react";
import { otpAtom} from "../atoms/atom";
import { useRecoilState } from "recoil";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Clock } from "./clock";

export function Otp({email,password}) {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useRecoilState(otpAtom);
    const [time,settime]=useState(60);

  useEffect(() => {
    if (time <= 0) return;
  const interval = setInterval(() => {
    settime(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [time]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function handleResend(e) {
    e.preventDefault();
    localStorage.removeItem("token");
  try {
    const response = await axios.post("https://easesplit.onrender.com/login", {
      email,
      password
    });

   
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      toast.success("OTP send to your mail");
      settime(60);
    } else if (response.data.message) {
      toast.error(response.data.message);
    } else {
      toast.error("Unexpected response from server.");
    }
  } catch (error) {
    
    toast.error(error.response?.data?.message || "Signup failed!");
  }
  };

 return (
  <div className="flex flex-col items-center space-y-4">
    <div className="flex space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputRefs.current[index] = el)}
          maxLength="1"
          className="w-10 h-10 text-center text-lg border border-gray-300 rounded"
        />
      ))}
    </div>
    
    {time > 0 && (
      <div className="text-gray-600 text-sm">
        <Clock time={time} />
      </div>
    )}
    
    <button
      onClick={(e) => handleResend(e)}
      disabled={time > 0}
      className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
    >
      Resend OTP
    </button>
  </div>
);
}
