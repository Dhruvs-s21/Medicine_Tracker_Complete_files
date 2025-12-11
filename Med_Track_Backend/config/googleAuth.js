const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// ⭐ STRATEGY 1 — REGISTER
passport.use(
  "google-register",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://medtrack-backend-7mw8.onrender.com/api/auth/google-verify/callback",
    },
    async (_, __, profile, done) => {
      return done(null, { email: profile.emails[0].value });
    }
  )
);

// ⭐ STRATEGY 2 — EMAIL UPDATE
passport.use(
  "google-email-update",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://medtrack-backend-7mw8.onrender.com/api/auth/google-verify-email-update/callback",
    },
    async (_, __, profile, done) => {
      return done(null, { email: profile.emails[0].value });
    }
  )
);

// ⭐ STRATEGY 3 — PASSWORD RESET
passport.use(
  "google-password-reset",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://medtrack-backend-7mw8.onrender.com/api/auth/google-password-reset/callback",
    },
    async (_, __, profile, done) => {
      return done(null, { email: profile.emails[0].value });
    }
  )
);

module.exports = passport;
