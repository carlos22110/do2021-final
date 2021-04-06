var express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  Actor = require('./api/models/actorModel'),
  Trip = require('./api/models/tripModel'),
  ApplyTrip = require('./api/models/applyTripModel'),
  bodyParser = require('body-parser');
  admin = require('firebase-admin'),
  serviceAccount = require("./acme-explorer-96392-firebase-adminsdk-utn5s-1b91b25e0d");
  http = require("http"),
  fs = require("fs");
  var logger = require('./logger');

  const keys = {
    key: fs.readFileSync('./keys/server.key'),
    cert: fs.readFileSync('./keys/server.cert')
  };
  
// MongoDB URI building
var mongoDBUser = process.env.mongoDBUser || "yulipala";
var mongoDBPass = process.env.mongoDBPass || "RUTA69ruta";
var mongoDBCredentials = (mongoDBUser && mongoDBPass) ? mongoDBUser + ":" + mongoDBPass + "@" : "";

var mongoDBHostname = process.env.mongoDBHostname || "localhost";
var mongoDBPort = process.env.DBPort || "27017";
var mongoDBName = process.env.mongoDBName || "ACME-Explorer";

mongoDBURI = "mongodb+srv://" + mongoDBUser + ":" + mongoDBPass + "@cluster0.ugodt.mongodb.net/acmeExplorer?retryWrites=true&w=majority";
var db = require('./db');
db.connect(function (err, _db) {
  logger.info('Initializing DB...');
  if(err) {
    logger.error('Error connecting to DB!', err);
    return 1;
  } else {
    db.find({}, function (err, patients) {
      if(err) {
        logger.error('Error while getting initial data from DB!', err);
      } else {
        if (patients.length === 0) {
          logger.info('Empty DB, loading initial data...');
          db.init();
      } else {
          logger.info('DB already has ' + patients.length + ' patients.');
      }
      }
    });
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, idToken" //ojo, que si metemos un parametro propio por la cabecera hay que declararlo aquí para que no de el error CORS
    );
    //res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    next();
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "http://acme-explorer-96392-default-rtdb.firebaseio.com/"
  });


var routesActors    = require('./api/routes/actorRoutes');
var routesTrip      = require('./api/routes/tripRoutes'); 
var routesApplyTrip = require('./api/routes/applyTripRoutes');
var routesStorage   = require('./api/routes/storageRoutes');
var routesLogin   = require('./api/routes/loginRoutes');


routesActors(app);
routesTrip(app);
routesApplyTrip(app);
routesStorage(app);
routesLogin(app);



console.log("Connecting DB to: " + mongoDBURI);

http.createServer(keys, app).listen(port);
console.log('ACME-Explorer RESTful API server started with HTTP on: ' + port);


module.exports = app;