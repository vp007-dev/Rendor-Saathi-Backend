// File: backend/routes/marketplace.js
const express = require('express');
const User = require('../models/User'); // Adjust path if needed
const router = express.Router();

const CATEGORIES = [ "Vegetables", "Fruits", "Dairy", "Spices", "Oils", "Breads", "Sauces", "Dal & Rice" ];

router.get('/categories', (req, res) => {
    res.status(200).json(CATEGORIES);
});

router.get('/suppliers/find-by-area', async (req, res) => {
    try {
        const { categories, area } = req.query;
        if (!categories || !area) {
            return res.status(400).json({ message: 'Categories and area are required.' });
        }
        const selectedCategories = categories.split(',');
        const query = {
            role: 'supplier',
            isVerified: true,
            suppliesCategories: { $in: selectedCategories },
            area: area
        };
        const suppliersInArea = await User.find(query);
        if (suppliersInArea.length === 0) {
            return res.status(404).json({ message: 'No suppliers found in your area for the selected categories.' });
        }
        const formattedSuppliers = suppliersInArea.map(supplier => ({
            id: supplier._id,
            name: supplier.name,
            businessName: supplier.businessName,
        }));
        res.status(200).json(formattedSuppliers);
    } catch (error) {
        console.error("FIND SUPPLIERS ERROR:", error);
        res.status(500).json({ message: 'Server error while finding suppliers.' });
    }
});

// --- NEW: Endpoint to get details for a single supplier ---
router.get('/supplier/:id', async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplier = await User.findById(supplierId);

        if (!supplier || supplier.role !== 'supplier') {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        // For now, we send back the necessary details.
        // Later, we can add product lists and reviews here.
        const supplierDetails = {
            id: supplier._id,
            businessName: supplier.businessName,
            contactName: supplier.name,
            area: supplier.area,
            address: supplier.warehouseAddress,
            yearEstablished: supplier.yearEstablished,
            providesDelivery: supplier.providesDelivery,
            suppliesCategories: supplier.suppliesCategories,
            // Placeholder for reviews
            reviews: [
                { id: 1, author: 'Raju Samosa', rating: 5, text: 'Very fresh vegetables, always on time!' },
                { id: 2, author: 'Priya Chaat', rating: 4, text: 'Good quality spices, but sometimes delivery is late.' }
            ]
        };

        res.status(200).json(supplierDetails);

    } catch (error) {
        console.error("GET SUPPLIER DETAILS ERROR:", error);
        res.status(500).json({ message: 'Server error while fetching supplier details.' });
    }
});


module.exports = router;
