const path = require("path");
const fs   = require("fs");
const Room = require("../models/room");

const normalizeAgeRange = (value) => {
  if (!value || value === "Any") return "Any";
  const match = String(value).trim().match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 16 || max > 99 || min > max) return null;
  return `${min}-${max}`;
};

const getRooms = async (req, res) => {
  try {
    const { location, maxPrice, type } = req.query;
    const filter = { status: { $ne: "Lended" } };

    if (location && location !== "all")
      filter.location = new RegExp(location, "i");
    if (maxPrice && maxPrice !== "all")
      filter.price = { $lte: Number(maxPrice) };
    if (type && type !== "all")
      filter.type = type;

    const rooms = await Room.find(filter)
      .populate("postedBy", "name email")
      .sort({ postedAt: -1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getFeaturedRooms = async (req, res) => {
  try {
    let rooms = await Room.find({ featured: true, status: { $ne: "Lended" } })
      .limit(6)
      .sort({ postedAt: -1 });

    if (rooms.length === 0) {
      rooms = await Room.find({ status: { $ne: "Lended" } })
        .limit(6)
        .sort({ postedAt: -1 });
    }

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ postedBy: req.user._id }).sort({ postedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("postedBy", "name email");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addRoom = async (req, res) => {
  try {
    const {
      title, price, location, type, description, amenities, featured,
      smoking, personality, schedule, gender, ageRange, pets, extraNotes, status
    } = req.body;

    if (!title || !price || !location)
      return res.status(400).json({ message: "Title, price and location are required" });

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }
    const normalizedAgeRange = normalizeAgeRange(ageRange || "18-24");
    if (!normalizedAgeRange) {
      return res.status(400).json({ message: "Age range must be in format min-max (for example 18-24) or Any" });
    }

    let parsedAmenities = [];
    if (typeof amenities === "string" && amenities.trim()) {
      try {
        const parsed = JSON.parse(amenities);
        parsedAmenities = Array.isArray(parsed) ? parsed : [];
      } catch {
        return res.status(400).json({ message: "Amenities format is invalid" });
      }
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    const room = await Room.create({
      title,
      price:    numericPrice,
      location,
      type:     type || "Shared Room",
      description,
      amenities: parsedAmenities,
      image:    imageUrl,
      featured: featured === "true",
      status:   status === "Lended" ? "Lended" : "Available",
      roommatePrefs: {
        smoking:     smoking === "true",
        personality: personality || "Quiet",
        schedule:    schedule   || "Student",
        gender:      gender     || "Any",
        ageRange:    normalizedAgeRange,
        pets:        pets === "true",
        extraNotes:  extraNotes || ""
      },
      postedBy: req.user._id
    });

    res.status(201).json(room);
  } catch (err) {
    if (err.message && err.message.includes("Age range must be")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Error adding room", error: err.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.postedBy.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      title, price, location, type, description, amenities, status,
      smoking, personality, schedule, gender, ageRange, pets, extraNotes
    } = req.body || {};

    if (title !== undefined) room.title = String(title).trim();
    if (location !== undefined) room.location = String(location).trim();
    if (type !== undefined) room.type = type;
    if (description !== undefined) room.description = description;
    if (status !== undefined) room.status = status === "Lended" ? "Lended" : "Available";

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: "Price must be a valid positive number" });
      }
      room.price = numericPrice;
    }

    if (amenities !== undefined) {
      if (Array.isArray(amenities)) {
        room.amenities = amenities;
      } else if (typeof amenities === "string") {
        try {
          const parsed = JSON.parse(amenities);
          room.amenities = Array.isArray(parsed) ? parsed : [];
        } catch {
          return res.status(400).json({ message: "Amenities format is invalid" });
        }
      }
    }

    room.roommatePrefs = {
      ...room.roommatePrefs,
      ...(smoking !== undefined ? { smoking: smoking === true || smoking === "true" } : {}),
      ...(personality !== undefined ? { personality } : {}),
      ...(schedule !== undefined ? { schedule } : {}),
      ...(gender !== undefined ? { gender } : {}),
      ...(ageRange !== undefined ? (() => {
        const normalized = normalizeAgeRange(ageRange);
        if (!normalized) throw new Error("Age range must be in format min-max (for example 18-24) or Any");
        return { ageRange: normalized };
      })() : {}),
      ...(pets !== undefined ? { pets: pets === true || pets === "true" } : {}),
      ...(extraNotes !== undefined ? { extraNotes } : {})
    };

    await room.save();
    res.json(room);
  } catch (err) {
    if (err.message && err.message.includes("Age range must be")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to update room", error: err.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.postedBy.toString() !== req.user._id)
      return res.status(403).json({ message: "Not authorized" });

    if (room.image && room.image.includes("/uploads/")) {
      const filename = room.image.split("/uploads/")[1];
      const filePath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await room.deleteOne();
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const seedRooms = async (req, res) => {
  try {
    await Room.deleteMany({});
    const rooms = [
      {
        title: "Bright Room Downtown", price: 550, location: "Amsterdam",
        type: "Shared Room", featured: true,
        description: "A bright, sunny shared room in the heart of downtown. Perfect for focused students.",
        amenities: ["WiFi", "Laundry", "Kitchen", "Study Room"],
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
        roommatePrefs: { smoking: false, personality: "Quiet", schedule: "Student", gender: "Any", ageRange: "18-25", pets: false, extraNotes: "Looking for a clean, quiet student" }
      },
      {
        title: "Charming Loft", price: 600, location: "Amsterdam",
        type: "Single Room", featured: true,
        description: "Beautiful loft with high ceilings and great natural light.",
        amenities: ["WiFi", "Gym", "Parking", "Balcony"],
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600",
        roommatePrefs: { smoking: false, personality: "Social", schedule: "Mixed", gender: "Any", ageRange: "20-30", pets: false, extraNotes: "Love having people over on weekends" }
      },
      {
        title: "Student House Room", price: 400, location: "Rotterdam",
        type: "Shared Room", featured: true,
        description: "Affordable shared room in a friendly student house. 10 min walk to campus.",
        amenities: ["WiFi", "Kitchen", "Garden", "Bike Storage"],
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
        roommatePrefs: { smoking: false, personality: "Quiet", schedule: "Student", gender: "Female", ageRange: "18-26", pets: false, extraNotes: "Female students only, studious house" }
      },
      {
        title: "Modern Studio Apartment", price: 750, location: "The Hague",
        type: "Studio", featured: true,
        description: "Private studio with modern amenities and city views.",
        amenities: ["WiFi", "AC", "Dishwasher", "Rooftop"],
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
        roommatePrefs: { smoking: false, personality: "Independent", schedule: "Working", gender: "Any", ageRange: "22-35", pets: true, extraNotes: "No parties, professional environment" }
      },
      {
        title: "Cozy Room Near Campus", price: 450, location: "Utrecht",
        type: "Shared Room", featured: true,
        description: "Cozy and affordable, 5 min walk from campus.",
        amenities: ["WiFi", "Kitchen", "Washer"],
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600",
        roommatePrefs: { smoking: false, personality: "Quiet", schedule: "Student", gender: "Any", ageRange: "18-28", pets: false, extraNotes: "Ideal for first-year students" }
      },
      {
        title: "Sunny Single Room", price: 500, location: "Eindhoven",
        type: "Single Room", featured: false,
        description: "Bright single room in a lively shared apartment.",
        amenities: ["WiFi", "Laundry", "Terrace", "Common Room"],
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600",
        roommatePrefs: { smoking: true, personality: "Social", schedule: "Mixed", gender: "Male", ageRange: "20-30", pets: false, extraNotes: "Social house, we hang out a lot" }
      }
    ];
    await Room.insertMany(rooms);
    res.json({ message: "Rooms seeded successfully", count: rooms.length });
  } catch (err) {
    res.status(500).json({ message: "Seed error", error: err.message });
  }
};

module.exports = { getRooms, getFeaturedRooms, getMyRooms, getRoomById, addRoom, updateRoom, deleteRoom, seedRooms };

