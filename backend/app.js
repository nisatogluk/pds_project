require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const authRouter = require('./routes/auth');
const itemRESTRouter = require('./routes/itemsREST');
const notificationsRouter = require('./routes/notificationsREST');
const usersRouter = require('./routes/usersREST');
const moderationRouter = require('./routes/moderationREST');

// DB Connection
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to DB!'))
    .catch((e) => console.log('❌ Error connecting to DB!', e));

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Access-Token']
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/occurrences', itemRESTRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/moderation', moderationRouter); // <- aqui!

// 404
app.use((req, res, next) => next(createError(404)));

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
    res.status(status).json({ message });
});

app.use('/api/v1/moderation', moderationRouter);

module.exports = app;
