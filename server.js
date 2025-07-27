
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');
const apiRoutes = require('./routes/api');
const forecastRoutes = require('./routes/forecast');
const leftoverRoutes = require('./routes/leftover');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '50mb' }));
// Connect to MongoDB using the variable from your .env file
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api', apiRoutes);
app.use('/api', forecastRoutes);
app.use('/api', leftoverRoutes);



// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));