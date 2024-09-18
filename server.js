const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');  // MongoDB connection
const userRoutes = require('./Routes/userRoutes');
const candidateRoutes = require('./Routes/candidateRoutes');

const app = express();
app.use(bodyParser.json()); // Use body-parser for parsing application/json

const PORT = process.env.PORT || 3000;

// Use the routes
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

// Handle 404 errors for unmatched routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Centralized error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);  // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
