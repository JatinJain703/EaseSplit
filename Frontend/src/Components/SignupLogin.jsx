import { Signup } from "./Signup";
import { Login } from "./Login";
import { useRecoilValue,useRecoilValueLoadable } from "recoil";
import { signup as signupAtom,authSelector} from "../atoms/atom";
import { TailSpin } from 'react-loader-spinner';
import { Navigate } from "react-router-dom";
export function SignupandLogin() {
      const auth = useRecoilValueLoadable(authSelector);

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
    return (
        <>
            {auth.contents ? <Navigate to="/Dashboard" /> : <Mainpage />}
        </>
    );
}

function Mainpage()
{
    const issignup = useRecoilValue(signupAtom);
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
            <div className="grid md:grid-cols-2 w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden">


                <div className="hidden md:flex items-center justify-center px-10 py-12 bg-gradient-to-br from-blue-100 to-white">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">
                        Fast, Efficient and Productive
                    </h1>
                </div>


                <div className="flex items-center justify-center bg-white px-10 py-12">
                    {issignup ? <Signup /> : <Login />}
                </div>

            </div>
        </div>
    );
}
