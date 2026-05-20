const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {};

const { STATUS, ROLES } = require('../constants');

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
            status: STATUS.PENDING,
            role: ROLES.CONTRIBUTOR
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

        if (user.status === STATUS.PENDING) {
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
//const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');
const config = require('../jwt_secret/config');

//var authController = {};

authController.login = async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email })
    // se o utilizador não existir enviar o erro 404 - not nfound
    if (!user) return res.status(404).send('No user found.');

    // verificar se a password é válida
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null })
    }

    // se o utilizador é encontrado e a password válida -> criar um token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // enviar a reposta com o token para o utilizador
    res.status(200).send({ auth: true, token: token });

  } catch (exception) {
    // erro ao executar a função de login no servidor
    console.log('Erro no login');
    res.status(500).send('Erro no login.');
  }
}

authController.register = async function (req, res) {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const userCreated = User.create({
      name: req.body.name || '',
      email: req.body.email,
      password: hashedPassword,
      role: req.body.email || "USER"
    })

    // Se o registo teve sucesso -> criar um token 
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // o token expira no fim de 24 horas
    });
    res.status(200).send({ auth: true, token: token });

  } catch (exception) {
    console.log('Erro ao registar utilizador na base de dados');
    res.status(500).json(err);
  }
}

authController.verifyToken = async function (req, res, next) {
  try {
    var token = req.headers['x-access-token'];
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });

    // verifica o token e a sua validade
    const decoded = await jwt.verify(token, config.secret)

    // com a verificação completa, inclui o userId na variável req para uso em rotas autenticadas
    req.userId = decoded.id;
    next();
  } catch (exception) {
    console.log('Erro ao verificar token de autenticação');
    res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
}

authController.verifyTokenAdmin = function (req, res, next) {
  try {
    var token = req.headers['x-access-token'];
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });

    // verifica o token e a sua validade
    const decoded = jwt.verify(token, config.secret)
    if (err || decoded.role !== 'ADMIN')
      return
    // com a verificação completa, inclui o userId na variável req para uso em rotas exclusivas de ADMIN
    req.userId = decoded.id;
    next();
  } catch (exception) {
    console.log('Erro ao verificar token de autenticação');
    res.status(500).send({ auth: false, message: 'Failed to authenticate token or not Admin' });
  }
}

module.exports = authController;