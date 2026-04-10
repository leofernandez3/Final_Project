const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const { isValidEmail, isStrongEnoughPassword } = require("../utils/validators");

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isPremium: user.isPremium
});

const register = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim().toLowerCase();
    const { password } = req.body || {};

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Please provide a valid email address" });
    if (!isStrongEnoughPassword(password))
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed });
    const token  = signToken(user);

    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const { password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    let isMatch = false;
    const isBcryptHash = /^\$2[aby]\$/.test(user.password);

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {

      isMatch = password === user.password;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const upgradePremium = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isPremium: true });
    const user  = await User.findById(req.user._id);
    const token = signToken(user);
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Upgrade failed", error: err.message });
  }
};

module.exports = { register, login, getMe, upgradePremium };
