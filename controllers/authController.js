const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {};

authController.register = async function (req, res) {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email já registado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            status: 'PENDING',
            role: 'Contributor'
        });

        await newUser.save();
        res.status(201).json({ message: "Utilizador registado." });
    } catch (error) {
        res.status(500).json({ error });
    }
};

authController.confirmEmail = async function (req, res) {
    try {
        const { email } = req.query;
        await User.findOneAndUpdate({ email }, { status: 'ACTIVE' });
        res.send("Conta ativada.");
    } catch (error) {
        res.status(500).send("Erro.");
    }
};

authController.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        if (user.status === 'PENDING') {
            return res.status(403).json({ message: "Conta não ativada." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            'chave_secreta_pds_2026',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: { name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};
authController.changePassword = async function (req, res) {
    try {
        // Recebe as passwords do body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Vai buscar o utilizador autenticado pelo token JWT
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }

        // Verifica se a password antiga está correcta
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password atual incorrecta." });
        }

        // Verifica se a nova password tem mínimo 8 caracteres
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "A nova password deve ter no mínimo 8 caracteres." });
        }

        // Verifica se a nova password coincide com a confirmação
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "As passwords não coincidem." });
        }

        // Encripta a nova password e guarda
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password alterada com sucesso." });
    } catch (error) {
        res.status(500).json({ error });
    }
};
module.exports = authController;