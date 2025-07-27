// File: backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');

const router = express.Router();

// --- VENDOR REGISTRATION & LOGIN ROUTES ---

router.post('/vendor/register', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const existingUser = await User.findOne({ mobileNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'A vendor with this mobile number already exists.' });
        }
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`Registration OTP for ${mobileNumber} is: ${otpCode}`);
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);
        await Otp.create({ mobileNumber, otp: hashedOtp });
        res.status(200).json({ message: 'OTP sent successfully. It will expire in 5 minutes.' });
    } catch (error) {
        console.error("VENDOR REGISTER ERROR:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

router.post('/vendor/verify', async (req, res) => {
    try {
        const { mobileNumber, otp, name, businessType, area } = req.body;
        const otpRecord = await Otp.findOne({ mobileNumber });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }
        const newUser = new User({ name, mobileNumber, businessType, role: 'vendor', area });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        await Otp.deleteOne({ mobileNumber });
        // --- FIXED: Send the full user object, including default badges ---
        res.status(201).json({ message: 'Vendor registered successfully!', token, vendor: newUser });
    } catch (error) {
        console.error("VENDOR VERIFY ERROR:", error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
});

router.post('/vendor/login', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const vendor = await User.findOne({ mobileNumber, role: 'vendor' });
        if (!vendor) {
            return res.status(404).json({ message: 'This mobile number is not registered as a vendor.' });
        }
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`Login OTP for ${mobileNumber} is: ${otpCode}`);
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);
        await Otp.create({ mobileNumber, otp: hashedOtp });
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error("VENDOR LOGIN ERROR:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

router.post('/vendor/login/verify', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        const otpRecord = await Otp.findOne({ mobileNumber });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }
        const vendor = await User.findOne({ mobileNumber, role: 'vendor' });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }
        const token = jwt.sign({ id: vendor._id, role: vendor.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        await Otp.deleteOne({ mobileNumber });
        // --- FIXED: Send the full user object, including badges ---
        res.status(200).json({ message: `Welcome back, ${vendor.name}!`, token, vendor: vendor });
    } catch (error) {
        console.error("VENDOR LOGIN VERIFY ERROR:", error);
        res.status(500).json({ message: 'Server error during login verification.' });
    }
});


// --- SUPPLIER REGISTRATION & LOGIN ROUTES ---
router.post('/supplier/register', async (req, res) => {
    try {
        const {
            businessName, name, email, password, mobileNumber,
            warehouseAddress, gstin, fssaiLicense, yearEstablished,
            suppliesCategories, providesDelivery, area
        } = req.body;

        const existingSupplier = await User.findOne({ email });
        if (existingSupplier) {
            return res.status(400).json({ message: 'A supplier with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newSupplier = new User({
            businessName, name, email, password: hashedPassword, mobileNumber,
            warehouseAddress, gstin, fssaiLicense, yearEstablished,
            suppliesCategories, providesDelivery, area,
            role: 'supplier', isVerified: false
        });

        await newSupplier.save();
        res.status(201).json({ message: 'Registration successful! Your account is pending verification from our team.' });
    } catch (error) {
        console.error("SUPPLIER REGISTER ERROR:", error);
        res.status(500).json({ message: 'Server error during supplier registration.' });
    }
});

router.post('/supplier/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const supplier = await User.findOne({ email, role: 'supplier' });
        if (!supplier) {
            return res.status(404).json({ message: 'Invalid credentials or supplier not found.' });
        }
        const isMatch = await bcrypt.compare(password, supplier.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        if (!supplier.isVerified) {
            return res.status(403).json({ message: 'Your account has not been verified yet. Please wait for approval.' });
        }
        const token = jwt.sign({ id: supplier._id, role: supplier.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // --- FIXED: Send the full user object ---
        res.status(200).json({ message: `Welcome back, ${supplier.name}!`, token, supplier: supplier });
    } catch (error) {
        console.error("SUPPLIER LOGIN ERROR:", error);
        res.status(500).json({ message: 'Server error during supplier login.' });
    }
});

module.exports = router;
