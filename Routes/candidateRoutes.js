const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

// Helper function to check if the user has admin role
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const newCandidate = new Candidate(req.body);
        const response = await newCandidate.save();
        res.status(200).json({ response });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT route to update candidate data
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const candidateID = req.params.candidateID;
        const updatedData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedData, { new: true, runValidators: true });
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE route to remove a candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }
        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Voting route
router.get('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const { candidateID } = req.params;
        const { id: userId } = req.user;

        const candidate = await Candidate.findById(candidateID);
        const user = await User.findById(userId);

        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Admins cannot vote' });
        if (user.isVoted) return res.status(400).json({ message: 'You have already voted' });

        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Vote count route
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        const voteRecord = candidates.map(c => ({ party: c.party, count: c.voteCount }));
        res.status(200).json(voteRecord);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all candidates (name and party only)
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party -_id');
        res.status(200).json(candidates);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;