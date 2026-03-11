const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

var authController = {};

// [RF1] - Registo: Transição para estado PENDING
authController.register = async function (req, res) {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    // Criar o utilizador - o status 'PENDING' é atribuído por defeito pelo Model
    const userCreated = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: "Contributor"
      // status: 'PENDING' (já definido no models/user.js)
    });

    // Configurar o envio de email (Ethereal)
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'michelle.schoen@ethereal.email', 
        pass: 'dEBrgUwZ5VrrBEFkXZ'               
      }
    });

    const urlConfirmacao = `http://localhost:3000/api/v1/auth/confirm/${userCreated.email}`;
    
    // Enviar o email de confirmação
    await transporter.sendMail({
      from: '"Sistema PDS" <noreply@pds.com>',
      to: userCreated.email,
      subject: "Confirmação de Registo - PDS",
      html: `<h1>Olá ${userCreated.name}!</h1>
             <p>A tua conta está atualmente como <strong>PENDING</strong>.</p>
             <p>Clica no link abaixo para passares a <strong>ACTIVE</strong>:</p>
             <a href="${urlConfirmacao}">ATIVAR MINHA CONTA</a>`
    });

    res.status(201).send({ 
      msg: "Utilizador registado com sucesso!", 
      status: userCreated.status 
    });

  } catch (exception) {
    console.log("ERRO NO REGISTO:", exception);
    res.status(500).send("Erro ao processar o registo. O email pode já existir.");
  }
};

// [Confirmação] - Transição PENDING -> ACTIVE
authController.confirmEmail = async function (req, res) {
    try {
      // Atualiza o estado conforme o Diagrama de Estados
      const updatedUser = await User.findOneAndUpdate(
        { email: req.params.email }, 
        { status: 'ACTIVE' },
        { new: true } // Para retornar o utilizador já atualizado
      );

      if (!updatedUser) {
        return res.status(404).send("Utilizador não encontrado.");
      }

      res.status(200).send(`
        <h1>Sucesso!</h1>
        <p>A conta de ${updatedUser.email} foi ativada.</p>
        <p>Estado atual: <strong>${updatedUser.status}</strong></p>
      `);
    } catch (err) {
      console.log("ERRO NA ATIVAÇÃO:", err);
      res.status(500).send("Erro técnico ao ativar a conta.");
    }
};

module.exports = authController;

const jwt = require('jsonwebtoken');

// [RF2] - Login de utilizadores
authController.login = async function (req, res) {
    try {
        const { email, password } = req.body;

        // 1. Procurar o utilizador na Base de Dados
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // 2. Verificar o Status (Bloquear se estiver PENDING)
        if (user.status === 'PENDING') {
            return res.status(403).json({ 
                message: "A sua conta ainda não foi ativada. Verifique o seu email." 
            });
        }

        // 3. Comparar a password enviada com a password encriptada (bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // 4. Gerar o Token JWT (Dá autorização para navegar no site)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            'chave_secreta_pds_2026', // Idealmente isto estaria no ficheiro .env
            { expiresIn: '1d' } // O login dura 24 horas
        );

        // 5. Enviar resposta de sucesso
        res.status(200).json({
            message: "Login realizado com sucesso!",
            token: token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Erro no servidor ao tentar fazer login", error });
    }
};