import React, { useEffect, useState } from "react";
import axios from "../utils/axios"; // using axios instance
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [localUser, setLocalUser] = useState({});
  const [loading, setLoading] = useState(true);

  // Read Google verification params
  const params = new URLSearchParams(window.location.search);
  const verifiedEmail = params.get("verifiedEmail");
  const verifiedToken = params.get("verifiedToken");

  const [emailInput, setEmailInput] = useState("");
  const [gToken, setGToken] = useState("");

  // Password fields
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // ===============================
  // Fetch Profile
  // ===============================
  const fetchProfile = async () => {
    try {
      const res = await axios.get("/auth/profile");

      setUser(res.data);
      setLocalUser(res.data);

      // Only set email if coming normally (not from verified email)
      if (!verifiedEmail) {
        setEmailInput(res.data.email);
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Apply Google verification result
  useEffect(() => {
    if (verifiedEmail) setEmailInput(verifiedEmail);
    if (verifiedToken) setGToken(verifiedToken);
  }, [verifiedEmail, verifiedToken]);

  // ===============================
  // Update NAME + PHONE
  // ===============================
  const updateBasic = async () => {
    if (!/^[0-9]{10}$/.test(localUser.phone))
      return toast.error("Phone number must be exactly 10 digits");

    if (!localUser.name.trim())
      return toast.error("Name cannot be empty");

    try {
      const res = await axios.put("/auth/profile", {
        name: localUser.name,
        phone: localUser.phone,
      });

      setUser(res.data);
      setLocalUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    }
  };

  // ===============================
  // UPDATE EMAIL (GOOGLE VERIFIED)
  // ===============================
  const updateEmail = async () => {
    if (!gToken)
      return toast.error("Please verify your new email with Google first.");

    try {
      const res = await axios.put("/auth/profile/email", {
        email: emailInput,
        verifiedToken: gToken,
      });

      // Replace user globally
      setUser(res.data.user);
      setLocalUser(res.data.user);
      setEmailInput(res.data.user.email);

      setGToken(""); // clear token
      toast.success("Email updated successfully");

      // Remove query params from URL
      window.history.replaceState({}, "", "/profile");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Email update failed");
    }
  };

  // ===============================
  // UPDATE PASSWORD
  // ===============================
  const updatePassword = async () => {
    if (!oldPass || !newPass) {
      return toast.error("Fill all password fields");
    }

    try {
      await axios.put("/auth/profile/password", {
        oldPassword: oldPass,
        newPassword: newPass,
      });

      toast.success("Password changed");
      setOldPass("");
      setNewPass("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password update failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-10">

      {/* ===============================
          BASIC INFO
      =============================== */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Basic Information
        </h3>

        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-gray-700 font-medium">Name</label>
            <input
              type="text"
              value={localUser.name || ""}
              onChange={(e) => setLocalUser({ ...localUser, name: e.target.value })}
              className="w-full mt-1 p-3 rounded-lg border border-gray-300"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-gray-700 font-medium">Phone</label>
            <input
              type="text"
              maxLength="10"
              value={localUser.phone || ""}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  setLocalUser({ ...localUser, phone: e.target.value });
                }
              }}
              className="w-full mt-1 p-3 rounded-lg border border-gray-300"
            />
          </div>

          <button
            onClick={updateBasic}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-lg"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* ===============================
          CHANGE EMAIL
      =============================== */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Change Email
        </h3>

        <div className="space-y-4">

          {/* Google Verify Button */}
          {!verifiedEmail && !gToken && (
            <a
              href="https://medtrack-backend-7mw8.onrender.com/api/auth/google-verify-email-update"
              className="block bg-red-500 text-white text-center py-3 rounded-xl font-medium hover:bg-red-600"
            >
              Verify New Email With Google
            </a>
          )}

          {/* Verification Success */}
          {verifiedEmail && (
            <div className="text-green-700 bg-green-100 border border-green-300 p-3 rounded text-center">
              Email Verified: {verifiedEmail}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="text-gray-700 font-medium">New Email</label>
            <input
              type="text"
              value={emailInput}
              disabled={!!gToken}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg border border-gray-300"
            />
          </div>

          <button
            onClick={updateEmail}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-lg"
          >
            Update Email
          </button>
        </div>
      </div>

      {/* ===============================
          RESET PASSWORD
      =============================== */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          Reset Password
        </h3>

        <div className="space-y-4">

          {/* OLD PASSWORD */}
          <div>
            <label className="text-gray-700 font-medium">Old Password</label>
            <div className="relative">
              <input
                type={showOldPass ? "text" : "password"}
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg border border-gray-300"
              />
              <span
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showOldPass ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="text-gray-700 font-medium">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg border border-gray-300"
              />
              <span
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showNewPass ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={updatePassword}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-lg"
          >
            Change Password
          </button>
        </div>
      </div>

    </div>
  );
};

export default Profile;
