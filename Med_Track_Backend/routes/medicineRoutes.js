const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  addMedicine,
  getMyMedicines,
  updateMedicine,
  deleteMedicine,
  getAvailableMedicines,
  makeAvailable,
  markDonated
} = require("../controllers/medicineController");

router.post("/add", auth, upload.single("image"), addMedicine);
router.get("/mine", auth, getMyMedicines);
router.put("/update/:id", auth, upload.single("image"), updateMedicine);
router.delete("/delete/:id", auth, deleteMedicine);

// New donation-related routes
router.put("/available/:id", auth, makeAvailable);
router.put("/donated/:id", auth, markDonated);

router.get("/discover", getAvailableMedicines);

module.exports = router;
