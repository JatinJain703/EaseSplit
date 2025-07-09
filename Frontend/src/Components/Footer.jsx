import { useNavigate } from "react-router-dom";

function NavButton({ label, nav }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/${nav}`)} 
      className="flex flex-col items-center text-blue-600 hover:text-blue-800 transition"
    >
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1 shadow">
        <span className="text-sm font-semibold">{label[0]}</span>
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export function Footer() {
  return (
    <footer className="bg-white py-2 shadow-inner">
      <div className="flex justify-around max-w-md mx-auto">
        <NavButton label="Friends" nav="Friends" />
        <NavButton label="Groups" nav="Groups" />
        <NavButton label="Activity" nav="Activity" />
        <NavButton label="My Acc" nav="MyAcc" />
      </div>
    </footer>
  );
}
