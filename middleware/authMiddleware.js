const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No token provided." });

    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(actualToken, 'chave_secreta_pds_2026', (err, decoded) => {
        if (err) return res.status(500).json({ message: "Failed to authenticate token." });
        req.user = decoded; // Isto guarda os dados do utilizador no pedido
        req.userId = decoded.id; 
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        return res.status(403).json({ message: "Requires Admin Role." });
    }
};

module.exports = { verifyToken, isAdmin };