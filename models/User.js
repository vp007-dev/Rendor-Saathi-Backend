const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobileNumber: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, enum: ['vendor', 'supplier', 'delivery_partner'], required: true },
    isActive: { type: Boolean, default: true },
    
    area: { type: String, trim: true, index: true },

    businessType: { type: String },
    menu: [{
        dishName: String,
        price: Number,
        ingredients: [{
            name: String,
            quantity: Number,
            unit: String
        }]
    }],

    badges: { type: [String], default: ['Beginning of Journey'] },
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
