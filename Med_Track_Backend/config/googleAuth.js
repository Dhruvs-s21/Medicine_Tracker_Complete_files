const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// We create TWO separate static strategies because Google does NOT allow dynamic callbacks
// This ensures both REGISTER and EMAIL-UPDATE verification work properly.

//
// ============================================================
// STRATEGY 1 — GOOGLE VERIFY FOR REGISTER
// ============================================================
//
passport.use(
  "google-register",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google-verify/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      return done(null, { email });
    }
  )
);

//
// ============================================================
// STRATEGY 2 — GOOGLE VERIFY FOR EMAIL UPDATE
// ============================================================
//
passport.use(
  "google-email-update",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "http://localhost:5000/api/auth/google-verify-email-update/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      return done(null, { email });
    }
  )
);

module.exports = passport;
