const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// get specific user 
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create user result
router.post('/:userId', upload.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!req.file) return res.status(400).json({ message: "No image file provided" });

        if (!Array.isArray(user.results)) {
            user.results = [];
        }

        user.results.push({
            prediction: "Normal", 
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        await user.save();
        res.status(201).json({ message: "Upload successful" });
    } catch (err) {
        console.error("SERVER ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;