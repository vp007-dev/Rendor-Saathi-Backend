// File: backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Common fields
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobileNumber: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, enum: ['vendor', 'supplier', 'delivery_partner'], required: true },
    isActive: { type: Boolean, default: true },
    
    // --- NEW: Area field for simple text-based location matching ---
    area: { type: String, trim: true, index: true }, // e.g., "Kamla Nagar"

    // Vendor-specific
    businessType: { type: String },
    menu: [{
        dishName: String,
        price: Number,
        ingredients: [{
            name: String,       // e.g., "Potato"
            quantity: Number,   // e.g., 0.1
            unit: String        // e.g., "kg"
        }]
    }], // <-- ADD THIS

    badges: { type: [String], default: ['Beginning of Journey'] },
    // Supplier-specific fields
    businessName: { type: String },
    gstin: { type: String },
    fssaiLicense: { type: String },
    yearEstablished: { type: Number },
    warehouseAddress: { type: String },
    suppliesCategories: { type: [String], index: true },
    providesDelivery: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
