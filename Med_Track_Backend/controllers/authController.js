const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =====================================================
// REGISTER
// =====================================================
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, verifiedToken } = req.body;

    if (!name || !email || !password || !phone)
      return res.status(400).json({ msg: "All fields are required" });

    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ msg: "Phone number must be 10 digits" });

    if (!verifiedToken)
      return res.status(400).json({
        msg: "You must verify your email with Google before registering",
      });

    let payload;
    try {
      payload = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired Google verification token" });
    }

    if (payload.email !== email)
      return res
        .status(400)
        .json({ msg: "Verified email does not match entered email" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      provider: "google",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      msg: "Registration success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
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

    res.json({
      msg: "Login success",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


// =====================================================
// PROFILE
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

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
// UPDATE EMAIL
// =====================================================
exports.updateEmail = async (req, res) => {
  try {
    const { email, verifiedToken } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    if (!verifiedToken)
      return res.status(400).json({
        message: "Please verify the new email using Google before updating",
      });

    let payload;
    try {
      payload = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or expired Google email verification token",
      });
    }

    if (payload.email !== email)
      return res.status(400).json({
        message: "Verified email does not match the new email",
      });

    const exists = await User.findOne({ email });
    if (exists && exists._id.toString() !== req.user.id)
      return res.status(400).json({ message: "Email already in use" });

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    ).select("-password");

    const newToken = jwt.sign({ id: updated._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Email updated successfully",
      user: updated,
      token: newToken,
    });
  } catch (error) {
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
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};


// =====================================================
// ⭐ VERIFIED PASSWORD RESET — Step 1
// =====================================================
exports.verifiedResetRequest = async (req, res) => {
  try {
    const { email, verifiedToken } = req.body;

    if (!verifiedToken)
      return res.status(400).json({ message: "Google verification required" });

    let payload;
    try {
      payload = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid/expired token" });
    }

    if (payload.email !== email)
      return res.status(400).json({ message: "Email mismatch" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not found" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({
      message: "Reset token created",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// =====================================================
// ⭐ VERIFIED PASSWORD RESET — Step 2
// =====================================================
// =====================================================
// ⭐ VERIFIED PASSWORD RESET — FINAL (DIRECT)
// =====================================================
exports.resetPasswordFinalDirect = async (req, res) => {
  try {
    const { email, verifiedToken, newPassword } = req.body;

    if (!email || !verifiedToken)
      return res.status(400).json({ message: "Verification required" });

    let payload;
    try {
      payload = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (payload.email !== email)
      return res.status(400).json({ message: "Email mismatch" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

