var express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  dbPort = process.env.DBPORT || "27017",
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
  
mongoose.connect('mongodb://mongo:' + dbPort, {useNewUrlParser: true});
mongoose.connection.on("open", function (err, conn) {
  console.log('ACME-Explorer RESTful API server started with HTTPS on: ' + port);
  http.createServer(keys, app).listen(port);
});
mongoose.connection.on("error", function (err, conn) {
  console.error("DB init error " + err);
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

module.exports = app;