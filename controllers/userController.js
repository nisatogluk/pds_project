const User = require('../models/user');
const bcrypt = require('bcryptjs');

const userController = {};

// [US#17] Update User Profile
userController.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { name, address, city, postalCode, mobile, profilePicture } = req.body;

        if (mobile && isNaN(mobile)) {
            return res.status(400).json({ message: "Mobile number must contain only digits." });
        }

        const updates = { name, address, city, postalCode, mobile, profilePicture };

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

// [US#18] Update Password
userController.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = userController;