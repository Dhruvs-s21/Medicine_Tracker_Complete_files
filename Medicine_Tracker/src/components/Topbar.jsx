import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Topbar() {
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b">
      
      {/* WELCOME USER */}
      <h2 className="text-xl font-semibold text-indigo-600">
        {user?.name ? `Hello, ${user.name}` : "Welcome"}
      </h2>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-lg border border-indigo-500 text-indigo-600 
                 hover:bg-indigo-50 transition font-medium"
      >
        Logout
      </button>
    </div>
  );
}

