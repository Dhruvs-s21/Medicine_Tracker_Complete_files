const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();
require("./cron/expiryChecker");

const app = express();

// MIDDLEWARES 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ IMPORTANT FIX: Serve uploaded images ⭐
// This allows frontend to access images stored in /uploads
app.use("/uploads", express.static("uploads"));

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
