import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const verifiedEmail = params.get("verifiedEmail");
  const verifiedToken = params.get("verifiedToken");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (password !== confirm)
      return toast.error("Passwords do not match");

    try {
      await axios.post("/auth/reset-password-final-direct", {
        email: verifiedEmail,
        verifiedToken,
        newPassword: password,
      });

      toast.success("Password updated!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">

        {/* STEP 1: Verify Email With Google */}
        {!verifiedEmail ? (
          <>
            <h2 className="text-xl font-bold mb-4">Verify Email</h2>

            <button
              className="w-full bg-indigo-600 text-white py-2 rounded"
              onClick={() =>
                window.location.href =
                  "https://medtrack-backend-7mw8.onrender.com/api/auth/google-password-reset"
              }
            >
              Verify with Google
            </button>
          </>
        ) : (
          <>
            {/* STEP 2: Enter New Password */}
            <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
            <p className="text-gray-600 mb-4">Verified: {verifiedEmail}</p>

            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              <button
                className="w-full bg-green-600 text-white py-2 rounded"
                type="submit"
              >
                Save Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
