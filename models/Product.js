// File: backend/models/Product.js
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true }, // e.g., "kg", "litre", "dozen"
    inStock: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);