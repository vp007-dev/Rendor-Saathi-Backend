const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const router = express.Router();
router.post('/menu/extract', async (req, res) => {
    const { imageBase64 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!imageBase64 || !apiKey) {
        return res.status(400).json({ message: 'Image and API Key are required.' });
    }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [
                { text: "You are an expert menu digitizer for an Indian street food app. Analyze this image of a menu. Extract a list of all the dishes and their corresponding prices. Return the data as a clean JSON array of objects, where each object has a 'dishName' (string) and a 'price' (number). Ignore any decorative text or items without prices." },
                { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
            ]
        }]
    };

    try {
        const response = await axios.post(url, payload);
        let jsonString = response.data.candidates[0].content.parts[0].text;
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const menuItems = JSON.parse(jsonString);
        res.json(menuItems);
    } catch (error) {
        console.error("Gemini API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Failed to extract menu from image." });
    }
});


router.post('/menu/save/:vendorId', async (req, res) => {
    try {
        const { menu } = req.body;
        const updatedVendor = await User.findByIdAndUpdate(
            req.params.vendorId,
            { menu: menu },
            { new: true }
        );
        res.json({ message: 'Menu saved successfully!', vendor: updatedVendor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/products/supplier/:supplierId', async (req, res) => {
    try {
        const products = await Product.find({ supplierId: req.params.supplierId });
        res.json(products);
    } catch (error) { res.status(500).json({ message: error.message }); }
});


router.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/orders/supplier/:supplierId', async (req, res) => {
    try {
        const orders = await Order.find({ supplierId: req.params.supplierId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/orders/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
        res.json(updatedOrder);
    } catch (error) { res.status(500).json({ message: error.message }); }
});


router.post('/reviews', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/reviews/supplier/:supplierId', async (req, res) => {
    try {
        const reviews = await Review.find({ supplierId: req.params.supplierId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) { res.status(500).json({ message: error.message }); }
});


router.put('/profile/:userId', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) { res.status(500).json({ message: error.message }); }
});


module.exports = router;
