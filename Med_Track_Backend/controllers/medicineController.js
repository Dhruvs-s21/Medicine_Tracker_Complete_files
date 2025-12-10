const Medicine = require("../models/Medicine");
const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;

// =========================================================
// ADD MEDICINE
// =========================================================
exports.addMedicine = async (req, res) => {
  try {
    const { name, description, expiryDate, quantity, city } = req.body;
    if (!name || !expiryDate || !quantity || !city) {
      return res.status(400).json({ msg: "name, expiryDate, quantity and city are required" });
    }

    let imageUrl = null;

    if (req.file) {
      try {
        const uploaded = await cloudinary.uploader.upload(req.file.path, {
          folder: "medtrack",
        });
        imageUrl = uploaded.secure_url;
      } catch (e) {
        console.error("Cloudinary upload failed:", e);
      } finally {
        await fs.unlink(req.file.path).catch(() => {});
      }
    }

    const med = await Medicine.create({
      name,
      description,
      expiryDate: new Date(expiryDate),
      quantity: Number(quantity),
      image: imageUrl,
      city,
      donor: req.user._id,
      status: "private",
    });

    res.status(201).json({ msg: "Medicine added", medicine: med });
  } catch (err) {
    console.error("Add medicine error:", err);
    res.status(500).json({ msg: "Error adding medicine" });
  }
};

// =========================================================
// GET MY MEDICINES
// =========================================================
exports.getMyMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find({ donor: req.user._id });
    res.json(meds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =========================================================
// UPDATE MEDICINE (FIXED VERSION)
// =========================================================
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    let med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ msg: "Medicine not found" });
    if (!med.donor.equals(req.user._id))
      return res.status(403).json({ msg: "Not allowed" });

    // Build update object WITHOUT image
    const updates = {
      name: req.body.name ?? med.name,
      description: req.body.description ?? med.description,
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : med.expiryDate,
      quantity: req.body.quantity ?? med.quantity,
      city: req.body.city ?? med.city,
    };

    // Only update image if a new file is uploaded
    if (req.file) {
      try {
        const uploaded = await cloudinary.uploader.upload(req.file.path, {
          folder: "medtrack",
        });
        updates.image = uploaded.secure_url;
      } catch (e) {
        console.error("Cloudinary upload error:", e);
      } finally {
        await fs.unlink(req.file.path).catch(() => {});
      }
    }

    med = await Medicine.findByIdAndUpdate(id, updates, { new: true });

    res.json({ msg: "Medicine updated", medicine: med });
  } catch (err) {
    console.error("Update med err:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =========================================================
// DELETE MEDICINE
// =========================================================
exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ msg: "Not found" });
    if (!med.donor.equals(req.user._id))
      return res.status(403).json({ msg: "Not allowed" });

    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =========================================================
// MAKE AVAILABLE FOR DONATION
// =========================================================
exports.makeAvailable = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ msg: "Not found" });
    if (!med.donor.equals(req.user._id))
      return res.status(403).json({ msg: "Not allowed" });

    med.status = "available";
    await med.save();

    res.json({ msg: "Medicine made available for donation", medicine: med });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =========================================================
// MARK DONATED
// =========================================================
exports.markDonated = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ msg: "Not found" });
    if (!med.donor.equals(req.user._id))
      return res.status(403).json({ msg: "Not allowed" });

    med.status = "donated";
    await med.save();

    res.json({ msg: "Medicine marked as donated", medicine: med });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =========================================================
// DISCOVER (AVAILABLE MEDS ONLY)
// =========================================================
exports.getAvailableMedicines = async (req, res) => {
  const meds = await Medicine.find({
    status: "available",
    expiryDate: { $gt: new Date() } // Hide expired medicines ALWAYS
  })
  .populate("donor", "name phone");

  res.json(meds);
};

