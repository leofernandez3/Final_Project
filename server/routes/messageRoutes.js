const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getInbox, getListingsInbox, getRoomMessages, sendMessageToLandlord } = require("../controllers/messageController");

router.get("/inbox", auth, getInbox);
router.get("/listings", auth, getListingsInbox);
router.get("/room/:roomId", auth, getRoomMessages);
router.post("/room/:roomId", auth, sendMessageToLandlord);

module.exports = router;
