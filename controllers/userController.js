const User = require('../models/user');

// [RF3] Função para atualizar os dados do perfil
exports.updateUserProfile = async (req, res) => {
    try {
        
        const userId = req.user.id;

        const updates = {
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            mobile: req.body.mobile
        };

    
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true } 
        ).select('-password'); 

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao atualizar o perfil.', 
            error: error.message 
        });
    }
};