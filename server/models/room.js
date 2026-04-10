const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  price:       { type: Number, required: true },
  location:    { type: String, required: true },
  type:        { type: String, enum: ["Shared Room", "Single Room", "Studio"], default: "Shared Room" },
  status:      { type: String, enum: ["Available", "Lended"], default: "Available" },
  description: String,
  amenities:   [String],
  image:       String,
  featured:    { type: Boolean, default: false },

  roommatePrefs: {
    smoking:    { type: Boolean, default: false },
    personality:{ type: String, default: "Quiet" },
    schedule:   { type: String, default: "Student" },
    gender:     { type: String, default: "Any" },
    ageRange:   { type: String, default: "18-24" },
    pets:       { type: Boolean, default: false },
    extraNotes: String
  },

  postedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  postedAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model("Room", RoomSchema);
