const nodemailer = require('nodemailer');

const emailService = {};

const getTransporter = async () => {
    if (process.env.NODE_ENV === 'development') {
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

/**
 * Send email confirmation for registration
 */
emailService.sendConfirmationEmail = async (email, token) => {
    try {
        const transporter = await getTransporter();
        
        const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/confirm-email?token=${token}`;

        const mailOptions = {
            from: `"Plataforma Cívica" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Confirma o teu email - Plataforma Cívica',
            html: `
                <h2>Bem-vindo à Plataforma Cívica!</h2>
                <p>Para completar o teu registo, clica no link abaixo para confirmar o teu email:</p>
                <p><a href="${confirmationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Email</a></p>
                <p>Ou copia este link: ${confirmationUrl}</p>
                <p>Este link expira em 24 horas.</p>
                <p>Se não realizaste este registo, por favor ignora este email.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Confirmation email sent to: ${email}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`[TEST] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Email confirmation error:", error);
        throw new Error("Failed to send confirmation email");
    }
};

/**
 * Send password reset email
 */
emailService.sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const transporter = await getTransporter();
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Plataforma Cívica" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Recupera a tua password - Plataforma Cívica',
            html: `
                <h2>Recuperação de Password</h2>
                <p>Recebemos um pedido para recuperar a tua password.</p>
                <p>Clica no link abaixo para definir uma nova password:</p>
                <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Recuperar Password</a></p>
                <p>Ou copia este link: ${resetUrl}</p>
                <p>Este link expira em 1 hora.</p>
                <p>Se não solicitaste esta recuperação, por favor ignora este email.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Password reset email sent to: ${email}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`[TEST] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Password reset email error:", error);
        throw new Error("Failed to send password reset email");
    }
};

/**
 * Send status update notification email
 */
emailService.sendStatusUpdateEmail = async (email, occurrenceTitle, newStatus) => {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: `"Plataforma Cívica" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Actualização de Status - ${occurrenceTitle}`,
            html: `
                <h2>Actualização de Status</h2>
                <p>O status da tua ocorrência "<strong>${occurrenceTitle}</strong>" foi actualizado para: <strong>${newStatus}</strong></p>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/occurrences" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Ocorrência</a></p>
                <p>Obrigado por contribuir para a Plataforma Cívica!</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Status update email sent to: ${email}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`[TEST] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Status update email error:", error);
        throw new Error("Failed to send status update email");
    }
};

/**
 * Send new comment notification email
 */
emailService.sendCommentNotificationEmail = async (email, occurrenceTitle, commenterName) => {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: `"Plataforma Cívica" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Novo comentário - ${occurrenceTitle}`,
            html: `
                <h2>Novo Comentário</h2>
                <p><strong>${commenterName}</strong> adicionou um comentário na tua ocorrência "<strong>${occurrenceTitle}</strong>"</p>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/occurrences" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Comentário</a></p>
                <p>Obrigado por manter a comunidade activa!</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Comment notification email sent to: ${email}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`[TEST] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Comment notification email error:", error);
        throw new Error("Failed to send comment notification email");
    }
};

module.exports = emailService;