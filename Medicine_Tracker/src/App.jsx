import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";   

import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import AddMedicine from "./pages/AddMedicine";
import Discover from "./pages/Discover";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";    

import Profile from "./pages/Profile";

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <p className="text-center mt-10 text-lg">Loading...</p>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="add-medicine" element={<AddMedicine />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
