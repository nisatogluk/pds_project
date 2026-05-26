const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

const userController = {};

userController.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { name, address, city, postalCode, phoneNumber, profilePhoto } = req.body;

        if (phoneNumber && isNaN(phoneNumber)) {
            return res.status(400).json({ message: "Phone number must contain only digits." });
        }

        const updates = { name, address, city, postalCode, phoneNumber, profilePhoto };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -role');

        if (!updatedUser) return res.status(404).json({ message: "User not found." });

        res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

userController.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id || req.user._id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new password are required." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "New password must be at least 8 characters." });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "Error updating password." });
    }
};

userController.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required." });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If email exists, a password reset link has been sent." });
        }

        const resetToken = jwt.sign(
            { id: user._id, type: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();

        try {
            await emailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (emailError) {
            console.error("Failed to send reset email:", emailError);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            return res.status(500).json({ message: "Failed to send reset email. Please try again." });
        }

        res.status(200).json({ message: "Password reset link has been sent to your email." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Error processing password recovery." });
    }
};

userController.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Token and new password are required." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ message: "Invalid token type." });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.resetPasswordToken !== token) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        if (new Date() > user.resetPasswordExpires) {
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            return res.status(400).json({ message: "Reset token has expired." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now login with your new password." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Error resetting password." });
    }
};

userController.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = userController;

module.exports = userController;