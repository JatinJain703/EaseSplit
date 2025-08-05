import FullLogo from '../assets/FullLogo.jpg'
import addexpense from "../assets/addexpense.png";
import organizeexpense from "../assets/organizeexpense.png";
import payback from "../assets/payback.png";
import trackbalance from "../assets/trackbalance.png";
import footer from "../assets/footer.svg";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useRecoilState, useSetRecoilState, useRecoilValueLoadable} from "recoil";
import { signup as signupAtom, authSelector } from "../atoms/atom";
import { Navigate } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';

export function Main() {
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

function Mainpage() {
    const setsignup = useSetRecoilState(signupAtom);
    const navigate = useNavigate();
    const handlesignup = () => {
        setsignup((c) => c = true);
        navigate("/SignupLogin");
    }
    const handlelogin = () => {
        setsignup((c) => c = false);
        navigate("/SignupLogin");
    }
    return (
        <div className="min-h-screen flex flex-col">
            <div className="h-[10vh] shadow-sm">
                <Header onsignup={handlesignup} onlogin={handlelogin} />
            </div>

            <div className="flex-grow bg-gray-50">
                <Body onsignup={handlesignup} />
            </div>

            <div>
                <img src={footer} alt='footer' className='w-full object-cover' />
            </div>
        </div>

    );
}

function Header({ onsignup, onlogin }) {
  return (
    <div className="h-full px-4 sm:px-8 flex items-center justify-between bg-white">
      <div className="flex items-center gap-2 sm:gap-3 sm:ml-10">
        <img
          src={FullLogo || "/placeholder.svg"}
          alt="Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm object-contain"
        />
        <span className="text-lg sm:text-2xl font-semibold text-blue-800">EaseSplit</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-6 sm:mr-10">
        <button onClick={onlogin} className="text-blue-600 hover:underline text-sm sm:text-base">
          Log in
        </button>
        <button
          onClick={onsignup}
          className="bg-blue-600 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow hover:bg-blue-700 transition-all text-sm sm:text-base"
        >
          Sign up
        </button>
      </div>
    </div>
  )
}


function Body({ onsignup }) {

    const features = [
        {
            title: "Track Balances",
            desc: "Always stay updated on who owes what with clear balance tracking across your groups.",
            icon: trackbalance,
        },
        {
            title: "Organize Expenses",
            desc: "Categorize and manage your shared costs easily — from rent to travel to dinner nights.",
            icon: organizeexpense,
        },
        {
            title: "Add Expenses Easily",
            desc: "Split bills in seconds with just a few taps. Add detailed notes, payers, and splits.",
            icon: addexpense,
        },
        {
            title: "Pay Friends Back",
            desc: "Settle up instantly and keep your friendships strong with simple payments and clear logs.",
            icon: payback,
        },
    ];

    const [current, setCurrent] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("called");
            setFade(false);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % features.length);
                setFade(true); 
            }, 300); 
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center px-6 py-10 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex flex-col md:flex-row w-full max-w-[1200px] items-center justify-between gap-12">
                
                <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                        Less stress when <br />
                        sharing expenses <br />
                        <span className="text-blue-600">with anyone.</span>
                    </h1>
                    <p className="text-gray-600 text-md">
                        Keep track of your shared expenses and balances with housemates,
                        trips, groups, partners, and more.
                    </p>
                    <button onClick={onsignup} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition">
                        Sign up
                    </button>
                </div>

                
                <div className="w-full md:w-1/2 flex flex-col items-center justify-end text-center">
                    <div
                        className={`transition-opacity duration-700 ease-in-out w-full flex flex-col items-center ${fade ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <img
                            src={features[current].icon}
                            alt={features[current].title}
                            className="w-[300px] md:w-[450px] h-auto object-contain mb-4"
                        />
                        <h3 className="text-xl md:text-2xl font-semibold text-blue-700">
                            {features[current].title}
                        </h3>
                        <p className="text-gray-600 text-md md:text-lg max-w-md mt-2 px-4">
                            {features[current].desc}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
