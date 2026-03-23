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
mongoose.connect('mongodb+srv://LeonorSilva:cjdkGGvr29@projetosoftware.hk3ohtf.mongodb.net/?appName=ProjetoSoftware')
  .then(() => console.log('✅ Connected to DB!'))
  .catch((e) => console.log('❌ Error connecting to DB!'));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/occurrences', itemRESTRouter);
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
});

module.exports = app;