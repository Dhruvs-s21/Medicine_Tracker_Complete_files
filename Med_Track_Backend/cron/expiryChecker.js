const cron = require("node-cron");
const Medicine = require("../models/Medicine");

cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running expiry check...");

    const today = new Date();

    // Expire ALL private and available medicines whose date <= today
    const result = await Medicine.updateMany(
      {
        expiryDate: { $lte: today },
        status: { $in: ["private", "available"] }
      },
      { $set: { status: "expired" } }
    );

    console.log("Expired medicines updated:", result.modifiedCount);
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});
