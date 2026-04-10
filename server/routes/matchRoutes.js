const express    = require("express");
const router     = express.Router();
const { findMatch } = require("../controllers/matchController");

router.post("/", findMatch);

module.exports = router;
