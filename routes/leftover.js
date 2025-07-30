const express = require('express');
const LeftoverListing = require('../models/LeftoverListing');
const router = express.Router();

router.post('/leftovers', async (req, res) => {
    try {
        const newListing = new LeftoverListing(req.body);
        await newListing.save();
        res.status(201).json(newListing);
    } catch (error) {
        console.error("CREATE LEFTOVER ERROR:", error);
        res.status(500).json({ message: 'Failed to create listing', error: error.message });
    }
});

router.get('/leftovers', async (req, res) => {
    const { area, vendorId } = req.query;
    if (!area || !vendorId) {
        return res.status(400).json({ message: 'Area and Vendor ID are required.' });
    }
    try {
        const listings = await LeftoverListing.find({
            area: area,
            status: 'Available'
        }).sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
    }
});

router.put('/leftovers/:listingId/buy', async (req, res) => {
    try {
        const listing = await LeftoverListing.findById(req.params.listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found.' });
        }
        if (listing.status === 'Sold') {
            return res.status(400).json({ message: 'This item has already been sold.' });
        }
        listing.status = 'Sold';
        await listing.save();
        res.json({ message: 'Purchase successful! The seller has been notified.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process purchase', error: error.message });
    }
});

module.exports = router;
