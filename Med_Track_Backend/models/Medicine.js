const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  expiryDate: Date,
  quantity: Number,
  image: String,
  city: String,
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Updated status (3 modes)
  status: {
    type: String,
    enum: ["private", "available", "donated"],
    default: "private",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
