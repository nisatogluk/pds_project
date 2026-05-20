const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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

// [US#19] Forgot Password with Nodemailer/Ethereal
userController.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'amparo1@ethereal.email', 
                pass: 'pJBnm6dh1nr8hANZ1f' 
            }
        });

        const mailOptions = {
            from: '"Plataforma Cívica" <nao-responder@plataforma.pt>',
            to: email,
            subject: 'Recuperação de Password',
            text: 'Clica neste link para recuperar a tua password: http://localhost:3000/reset',
            html: '<b>Clica neste link para recuperar a tua password:</b> <a href="http://localhost:3000/reset">Recuperar Password</a>'
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`[RF12/US19] Email enviado com sucesso para: ${email}`);

        console.log(`[TESTE] Abre este link para ver o email: ${nodemailer.getTestMessageUrl(info)}`);

        res.status(200).json({ message: "Recovery email sent successfully via Ethereal." });
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        res.status(500).json({ error: "Failed to send email." });
    }
};

module.exports = userController;