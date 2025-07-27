// File: backend/models/Order.js
const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number },
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['New', 'Accepted', 'Ready for Pickup', 'Completed'], default: 'New' },
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);