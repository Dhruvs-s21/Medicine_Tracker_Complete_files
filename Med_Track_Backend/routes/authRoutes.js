const router = require("express").Router();
const passport = require("../config/googleAuth");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  getProfile,
  updateProfile,
  updateEmail,
  updatePassword,
} = require("../controllers/authController");


// ====================================================
// REGISTER — GOOGLE EMAIL VERIFY
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
      `http://localhost:5173/register?verifiedEmail=${encodeURIComponent(
        verifiedEmail
      )}&verifiedToken=${verifiedToken}`
    );
  }
);


// ====================================================
// EMAIL UPDATE — GOOGLE VERIFY
// ====================================================
router.get(
  "/google-verify-email-update",
  passport.authenticate("google-email-update", { scope: ["email"] })
);

router.get(
  "/google-verify-email-update/callback",
  passport.authenticate("google-email-update", { session: false }),
  (req, res) => {
    const verifiedEmail = req.user.email;

    const verifiedToken = jwt.sign(
      { email: verifiedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.redirect(
      `http://localhost:5173/profile?verifiedEmail=${encodeURIComponent(
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

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/email", authMiddleware, updateEmail);
router.put("/profile/password", authMiddleware, updatePassword);

module.exports = router;
