const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json')

//const itemsRESTRouter = require('./routes/itemsREST');
const authRouter = require('./routes/auth');

mongoose.Promise = global.Promise

mongoose.connect('mongodb+srv://LeonorSilva:cjdkGGvr29@projetosoftware.hk3ohtf.mongodb.net/?appName=ProjetoSoftware')
  .then(()=> console.log(' connected to DB!'))
  .catch((e)=> {console.log(' error connecting to DB!')})

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/auth', authRouter);
//app.use('/api/v1/items', itemsRESTRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});


module.exports = app;

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
