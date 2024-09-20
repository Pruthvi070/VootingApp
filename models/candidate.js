const mongoose = require('mongoose');

// Define the Candidate schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18, // Example validation: Age should be at least 18
        max: 120 // Example validation: Age should not exceed 120
    },
    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now // Default value as a function
            }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    }
});

// Create an index on the votes.user field for better performance on queries
candidateSchema.index({ 'votes.user': 1 });

// Create the Candidate model
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;