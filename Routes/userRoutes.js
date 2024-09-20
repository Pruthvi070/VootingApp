const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // Check if all required fields are present
        const requiredFields = ['name', 'aadharCardNumber', 'email', 'age', 'password', 'address', 'role'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({ error: `Missing field: ${field}` });
            }
        }

        // Check if the user role is 'admin' and if an admin already exists
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Check if the Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        // Create and save new user
        const newUser = new User(data);
        await newUser.save();

        // Generate token for the new user
        const payload = { id: newUser.id };
        const token = generateToken(payload);

        res.status(201).json({ user: newUser, token });
    } catch (err) {
        console.error('Signup Error:', err.message); // Log the error message for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        const user = await User.findOne({ aadharCardNumber });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Aadhar Card Number or Password' });
        }

        const payload = { id: user.id };
        const token = generateToken(payload);
        res.json({ token });
    } catch (err) {
        console.error('Login Error:', err.message); // Log the error message for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error('Profile Retrieval Error:', err.message); // Log the error message for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update password route
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error('Password Update Error:', err.message); // Log the error message for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
