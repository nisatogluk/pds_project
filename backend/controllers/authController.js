const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { STATUS, ROLES } = require('../constants');
const emailService = require('../services/emailService');

const authController = {};

/**
 * Register a new user with email confirmation
 */
authController.register = async function (req, res) {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            status: STATUS.PENDING,
            role: ROLES.CONTRIBUTOR
        });

        await newUser.save();

        // Generate confirmation token
        const confirmationToken = jwt.sign(
            { id: newUser._id, type: 'email_confirmation' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send confirmation email
        try {
            await emailService.sendConfirmationEmail(newUser.email, confirmationToken);
            res.status(201).json({ 
                message: "User registered successfully. Please check your email to confirm your account.",
                email: newUser.email
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Still register user, but notify about email issue
            res.status(201).json({ 
                message: "User registered, but email confirmation could not be sent. Please try again later.",
                email: newUser.email
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error registering user." });
    }
};

/**
 * Confirm email with token (requires verification token)
 */
authController.confirmEmail = async function (req, res) {
    try {
        // In production, this should use a token sent via email
        // For now, this endpoint should be protected
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Verification token required." });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.status === STATUS.ACTIVE) {
            return res.status(400).json({ message: "Account already activated." });
        }

        user.status = STATUS.ACTIVE;
        await user.save();

        res.status(200).json({ message: "Email confirmed successfully." });
    } catch (error) {
        console.error("Email confirmation error:", error);
        res.status(500).json({ message: "Invalid or expired token." });
    }
};

/**
 * User login
 */
authController.login = async function (req, res) {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required." });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Check account status
        if (user.status === STATUS.PENDING) {
            return res.status(403).json({ message: "Account not activated. Please confirm your email." });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { 
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role 
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error during login." });
    }
};

module.exports = authController;