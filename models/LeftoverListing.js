// File: backend/models/LeftoverListing.js
const mongoose = require('mongoose');

const leftoverListingSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String, required: true },
    sellerBusinessName: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }, // e.g., "kg", "litre"
    price: { type: Number, required: true },
    area: { type: String, required: true, index: true },
    status: { type: String, enum: ['Available', 'Sold'], default: 'Available' },
}, { timestamps: true });

module.exports = mongoose.model('LeftoverListing', leftoverListingSchema);