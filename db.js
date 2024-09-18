const mongoose = require('mongoose');

// Hardcoded MongoDB connection URL for production
const mongoURL = 'mongodb+srv://rajjj:21512757@cluster2.di19s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2';

// Set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Get the default connection
const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', () => {
    console.log(`Connected to MongoDB server: ${mongoURL}`);
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;
