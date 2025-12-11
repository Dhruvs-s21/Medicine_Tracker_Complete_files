const router = require("express").Router();
const passport = require("../config/googleAuth");
const jwt = require("jsonwebtoken");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  getProfile,
  updateProfile,
  updateEmail,
  updatePassword,
  verifiedResetRequest,
  resetPasswordFinalDirect,
} = require("../controllers/authController");

// 🌐 CORRECT FRONTEND URL
const FRONTEND_URL = "https://medicine-tracker-complete-files.vercel.app";


// ====================================================
// GOOGLE VERIFY — REGISTER
// ====================================================
router.get(
  "/google-verify",
  passport.authenticate("google-register", { scope: ["email"] })
);

router.get(
  "/google-verify/callback",
  passport.authenticate("google-register", { session: false }),
  (req, res) => {
    const verifiedEmail = req.user.email;

    const verifiedToken = jwt.sign(
      { email: verifiedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.redirect(
      `${FRONTEND_URL}/register?verifiedEmail=${encodeURIComponent(
        verifiedEmail
      )}&verifiedToken=${verifiedToken}`
    );
  }
);


// ====================================================
// GOOGLE VERIFY — PASSWORD RESET
// ====================================================
router.get(
  "/google-password-reset",
  passport.authenticate("google-password-reset", { scope: ["email"] })
);

router.get(
  "/google-password-reset/callback",
  passport.authenticate("google-password-reset", { session: false }),
  (req, res) => {
    const verifiedEmail = req.user.email;

    const verifiedToken = jwt.sign(
      { email: verifiedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.redirect(
      `${FRONTEND_URL}/forgot-password?verifiedEmail=${encodeURIComponent(
        verifiedEmail
      )}&verifiedToken=${verifiedToken}`
    );
  }
);


// ====================================================
// NORMAL AUTH ROUTES
// ====================================================
router.post("/register", register);
router.post("/login", login);

// Protected Routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/email", authMiddleware, updateEmail);
router.put("/profile/password", authMiddleware, updatePassword);


// ====================================================
// PASSWORD RESET
// ====================================================
router.post("/verified-reset-request", verifiedResetRequest);
router.post("/reset-password-final-direct", resetPasswordFinalDirect);

module.exports = router;
