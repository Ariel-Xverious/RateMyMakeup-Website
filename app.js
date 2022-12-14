var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require("mongoose");
var dbconfig = require("./config/database");
var passport = require("passport");
var cors = require("cors");
var session = require("express-session");

var usersRouter = require('./routes/users');
var rateMyMakeupRoutes = require('./routes/rateMyMakeup.js');

mongoose.connect(dbconfig.database);
let db = mongoose.connection;

db.once("open", function(){
  console.log("Connected to Mongo.")
})

db.on("error", function (err){
  console.log("Error Accessing Database")
})

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {},
}));

require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors())

let Restaurant = require("./schemas/makeup")

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get("*", function(req, res, next){
  res.locals.user = req.user || null;
  next();
})

app.use('/app', rateMyMakeupRoutes);
app.use('/users', usersRouter);

app.use("/", function (req, res) {
  Restaurant.find({}, function (err, makeups) {
    if (err) {
      console.log("error");
    } else {
      res.render("index", {
        'title': "Rate My Makeup",
        'makeups': makeups,
      });
    }
  });
});

app.use(function(req, res, next) {
  next(createError(404));
});

// handling errors with error page
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
