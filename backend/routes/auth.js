const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const jwt     = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });
    await User.create({ name, email, password });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const secret = process.env.JWT_SECRET || 'your_secret';
      const token  = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET PROFILE (requires auth) ─────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    console.log("GET /profile requested for user ID:", req.user?.id);
    // Debugging: Log this to your Terminal to see if req.user exists
    console.log("User from Token:", req.user);
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid session" });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.warn("User not found in DB for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE PROFILE (requires auth) ──────────────────────────────────────────
// router.put('/profile', protect, async (req, res) => {
//   try {
//     const { name, email, currentPassword, newPassword } = req.body;
//     console.log("PUT /profile requested for user ID:", req.user?.id);

//     if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
//       return res.status(400).json({ message: "Invalid session" });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 1. Password change logic
//     if (newPassword) {
//       if (!currentPassword) {
//         return res.status(400).json({ message: "Current password required" });
//       }
//       const isMatch = await user.matchPassword(currentPassword);
//       if (!isMatch) {
//         return res.status(401).json({ message: "Current password incorrect" });
//       }
//       user.password = newPassword;
//     }

//     // 2. Email change logic
//     if (email && email !== user.email) {
//       const emailExists = await User.findOne({ email });
//       if (emailExists) {
//         return res.status(400).json({ message: "Email already in use" });
//       }
//       user.email = email;
//     }

//     // 3. Name change logic
//     if (name) {
//       user.name = name;
//     }

//     // 4. Save and generate new token
//     await user.save();
    
//     const secret = process.env.JWT_SECRET || 'your_secret';
//     const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });

//     res.json({
//       message: "Profile updated successfully",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (err) {
//     console.error("PUT PROFILE ERROR:", err);
//     if (err.code === 11000) {
//       return res.status(400).json({ message: "Email is already in use by another account" });
//     }
//     res.status(500).json({ error: err.message });
//   }
// });
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Find user by ID attached from 'protect' middleware
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Only run password logic if newPassword is provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required to set new password" });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password incorrect" });
      }
      user.password = newPassword; // The pre-save hook in your model will hash this
    }

    // 2. Update other fields only if they are provided in the request
    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    await user.save();
    
    // 3. Generate a fresh token
    const secret = process.env.JWT_SECRET || 'your_secret';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });

    res.json({
      message: "Profile updated successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("PUT PROFILE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;