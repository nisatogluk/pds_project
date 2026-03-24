const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // Vai buscar o token do header
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido." });
    }

    try {
        // Verifica e descodifica o token
        const decoded = jwt.verify(token, 'chave_secreta_pds_2026');
        req.user = decoded; // guarda os dados do utilizador no request
        next(); // continua para o controller
    } catch (error) {
        return res.status(401).json({ message: "Token inválido." });
    }
}

module.exports = verifyToken;
