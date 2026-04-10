const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const auth    = require("../middleware/auth");
const {
  getRooms,
  getFeaturedRooms,
  getMyRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
  seedRooms
} = require("../controllers/roomController");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `room-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext)
      ? cb(null, true)
      : cb(new Error("Only jpg, jpeg, png, webp files are allowed"));
  }
});

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image must be under 5MB" });
      }
      return res.status(400).json({ message: err.message });
    }

    return res.status(400).json({ message: err.message || "Invalid image upload" });
  });
};

router.get("/featured",        getFeaturedRooms);
router.get("/mine",    auth,   getMyRooms);
router.get("/",                getRooms);
router.get("/:id",             getRoomById);
router.post("/",       auth,   uploadImage, addRoom);
router.put("/:id",     auth,   updateRoom);
router.delete("/:id",  auth,   deleteRoom);
router.post("/seed",           seedRooms);

module.exports = router;
