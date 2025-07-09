import { atom ,selector} from "recoil";
import axios from "axios";
export const signup = atom({
	key: "signup",
	default: true,
})
export const otpgeneratedAtom=atom({
  key:"generated",
  default:false
})
 export const otpAtom=atom({
  key:"otp",
  default:Array(6).fill("")
})

export const authSelector = selector({
  key: "authSelector",
  get: async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const response = await axios.get("http://localhost:3000/auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem("userid",response.data.userid)
      return true;
    } catch {
      localStorage.removeItem("token");
      return false;
    }
  },
});