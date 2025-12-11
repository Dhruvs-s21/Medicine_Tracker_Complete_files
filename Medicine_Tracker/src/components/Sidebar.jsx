import { NavLink, useNavigate } from "react-router-dom";
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();     // clears localStorage + context
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white shadow-lg p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 text-indigo-600">
        Medicine Tracker
      </h2>

      <nav className="flex flex-col gap-3">

        <NavLink 
          to="/dashboard"
          end
          className={({ isActive }) =>
            `sidebar-link flex items-center gap-3 p-3 rounded-md transition 
            ${isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <HomeIcon className="w-5 h-5" />
          Dashboard
        </NavLink>

        <NavLink 
          to="/medicines"
          className={({ isActive }) =>
            `sidebar-link flex items-center gap-3 p-3 rounded-md transition 
            ${isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <ClipboardDocumentListIcon className="w-5 h-5" />
          My Medicines
        </NavLink>

        <NavLink 
          to="/add-medicine"
          className={({ isActive }) =>
            `sidebar-link flex items-center gap-3 p-3 rounded-md transition 
            ${isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <PlusCircleIcon className="w-5 h-5" />
          Add Medicine
        </NavLink>

        <NavLink 
          to="/discover"
          className={({ isActive }) =>
            `sidebar-link flex items-center gap-3 p-3 rounded-md transition 
            ${isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          Discover
        </NavLink>

        <NavLink 
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link flex items-center gap-3 p-3 rounded-md transition 
            ${isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`
          }
        >
          <UserCircleIcon className="w-5 h-5" />
          Profile
        </NavLink>

       

      </nav>
    </div>
  );
}
