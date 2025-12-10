const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// REGISTER (Google Verified Email Required)
// =====================================================
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, verifiedToken } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ msg: "Phone number must be 10 digits" });
    }

    // Must include Google verification
    if (!verifiedToken) {
      return res.status(400).json({
        msg: "You must verify your email with Google before registering",
      });
    }

    // Validate token
    let payload;
    try {
      payload = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        msg: "Invalid or expired Google verification token",
      });
    }

    // Token email must match entered email
    if (payload.email !== email) {
      return res.status(400).json({
        msg: "Google verified email does not match entered email",
      });
    }

    // Check if email exists already
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ msg: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      provider: "google",
    });

    // Create login token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res.status(201).json({
      msg: "Registration success",
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =====================================================
// LOGIN
// =====================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res.json({ msg: "Login success", token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =====================================================
// GET PROFILE
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// =====================================================
// UPDATE NAME + PHONE
// =====================================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

// =====================================================
// UPDATE EMAIL (Google Verified)
// =====================================================
exports.updateEmail = async (req, res) => {
  try {
    const { email, verifiedToken } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Must include Google verification token
    if (!verifiedToken) {
      return res.status(400).json({
        message: "Please verify the new email using Google before updating",
      });
    }

    // Validate Google verification token
    let payload;
    try {
      payload = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or expired Google email verification token",
      });
    }

    // Token email must match the new email
    if (payload.email !== email) {
      return res.status(400).json({
        message: "Verified email does not match the new email",
      });
    }

    // Check if email belongs to another user (not the same user)
    const exists = await User.findOne({ email });
    if (exists && exists._id.toString() !== req.user.id) {
      return res.status(400).json({ message: "Email already in use by another user" });
    }

    // Update email
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    ).select("-password");

    // Issue NEW login token (email changed)
    const newToken = jwt.sign({ id: updated._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Email updated successfully",
      user: updated,
      token: newToken,
    });
  } catch (error) {
    console.error("Update Email Error:", error);
    res.status(500).json({ message: "Error updating email" });
  }
};

// =====================================================
// UPDATE PASSWORD
// =====================================================
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};
