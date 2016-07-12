let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let cors = require('cors');
let helmet = require('helmet');
let jwt = require('jsonwebtoken');

let connection = require('./configure/connection');
let jwtConfig = require('./configure/jwt');

let routes = require('./routes/index');
let login = require('./routes/login');
let users = require('./routes/users');
let partials = require('./routes/partials');
let dialogs = require('./routes/dialogs');
let basic = require('./routes/basic');
let patient = require('./routes/patient');
let members = require('./routes/members');
let appoint = require('./routes/appoint');

// API
let apiLogin = require('./routes/api/login');
let apiPatient = require('./routes/api/patient');
let apiMember = require('./routes/api/members');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(helmet.frameguard({ action: 'deny' }));

app.use(session({
  secret: 'MySecretkEy1-9',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

let auth = (req, res, next) => {
  if (!req.session.logged) {
    if (req.xhr) {
      return res.status(403).send({
          success: false,
          msg: 'Authentication failed.'
        });
    } else {
      res.redirect('/login')
    }
  } else {
    next();
  }
};

let checkToken = (req, res, next) => {

  // check header or url parameters or post parameters for token
  let token = req.body.token || req.query.token || req.headers['x-access-token'];
  let secretKey = jwtConfig.getSecretKey();

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).send({
          success: false,
          msg: 'Authentication failed.'
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        msg: 'No token provided.'
    });

  }

};

app.use(function(req,res,next){
  res.locals.session = req.session;
  next();
});

let db = connection.getDatabaseConnection();
let dbHIS = connection.getHISConnection();

app.use((req, res, next) => {
  req.db = db;
  req.dbHIS = dbHIS;
  next();
});

app.use('/api/login', apiLogin);
app.use('/api/patient', checkToken, apiPatient);
app.use('/api/member', checkToken, apiMember);

app.use('/partials', auth, partials);
app.use('/patient', auth, patient);
app.use('/members', auth, members);
app.use('/appoint', auth, appoint);
app.use('/dialogs', auth, dialogs);
app.use('/users', auth, users);
app.use('/login', login);
app.use('/basic', basic);

app.use('/', auth, routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  res.send({
    message: err.message,
    error: {}
  });
});


module.exports = app;
