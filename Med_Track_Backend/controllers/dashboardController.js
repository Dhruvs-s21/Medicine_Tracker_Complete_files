const Medicine = require("../models/Medicine");


exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Medicines added by user
    const myMedicines = await Medicine.countDocuments({ donor: userId });

    // Available medicines by user
    const availableMedicines = await Medicine.countDocuments({
      donor: userId,
      status: "available",
    });


    res.json({
      myMedicines,
      availableMedicines,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error loading dashboard data" });
  }
};
