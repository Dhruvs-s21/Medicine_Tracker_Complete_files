import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email");
  const verifiedToken = params.get("verifiedToken");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm)
      return toast.error("Passwords do not match");

    try {
      await axios.post("/auth/verified-reset-final", {
        email,
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
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Set New Password
        </h2>

        <p className="text-center text-gray-600 mb-4">
          Verified Email: <b>{email}</b>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg text-lg"
            type="submit"
          >
            Save Password
          </button>
        </form>

      </div>
    </div>
  );
}
