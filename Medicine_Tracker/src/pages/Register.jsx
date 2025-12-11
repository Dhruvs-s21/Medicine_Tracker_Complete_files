import { useState, useEffect } from "react";
import axios from "../utils/axios.js";   // ✅ use your axios instance
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Read verifiedEmail & verifiedToken from Google redirect
  const params = new URLSearchParams(window.location.search);
  const verifiedEmail = params.get("verifiedEmail");
  const verifiedToken = params.get("verifiedToken");

  const [form, setForm] = useState({
    name: "",
    email: verifiedEmail || "",
    phone: "",
    password: "",
    verifiedToken: verifiedToken || "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (verifiedEmail || verifiedToken) {
      setForm((prev) => ({
        ...prev,
        email: verifiedEmail || prev.email,
        verifiedToken: verifiedToken || prev.verifiedToken,
      }));
    }
  }, [verifiedEmail, verifiedToken]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.verifiedToken) {
      return toast.error("Please verify your email using Google before registering.");
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return toast.error("Phone number must be 10 digits");
    }

    try {
      const res = await axios.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        verifiedToken: form.verifiedToken,
      });

      toast.success("Registration successful!");

      // Automatically login
      loginUser(res.data.user, res.data.token);

      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex justify-center items-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Create Account
        </h2>

        {/* Show Google verify button only if not verified */}
        {!verifiedEmail || !verifiedToken ? (
          <a
            href="https://medtrack-backend-7mw8.onrender.com/api/auth/google-verify"
            className="w-full block bg-red-500 text-white py-2 rounded-lg text-center mb-5 font-medium"
          >
            Verify Email with Google
          </a>
        ) : (
          <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded mb-4 text-center">
            Email verified: {verifiedEmail}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded-lg px-4 py-2 bg-gray-100"
              value={form.email}
              disabled={!!form.verifiedToken}
              placeholder="Verify using Google"
              required
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phone: val });
              }}
              maxLength="10"
              placeholder="Enter 10-digit phone number"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-indigo-500"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600 text-lg"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-lg hover:bg-indigo-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
