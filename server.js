// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


//start express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//session
var session = require("express-session");

//配置中间件
app.use(
  session({
    secret: "this is string key", 
    name:
      "session_id" ,
    resave: false ,
    saveUninitialized: true, 
    cookie: {
      maxAge: 1000 * 30 * 60 
    },
    rolling: true 
  })
);

// middleware to make 'user' available to all templates
app.use(function(req, res, next) {
  res.locals.loginUser = req.session.loginUser;
  res.locals.loginAdmin = req.session.loginAdmin;
  next();
});

// Establish a connection with the Mongo Database
// Get the username, password, host, and databse from the .env file
const mongoDB =
  "mongodb+srv://" +
  process.env.USERNAME +
  ":" +
  process.env.PASSWORD +
  "@" +
  process.env.HOST +
  "/" +
  process.env.DATABASE;
mongoose.connect(mongoDB, { useNewUrlParser: true, retryWrites: true });

//debugging
mongoose.connection.on("connected", function() {
  console.log("Mongoose connected to " + process.env.DATABASE);
});

mongoose.connection.on("error", function(err) {
  console.log("Mongoose connection error: " + err);
});

mongoose.connection.on("disconnected", function() {
  console.log("Mongoose disconnected.");
});

// set the view engine
app.set("views", __dirname + "/views/");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

//use the static files in the public folder
app.use(express.static("public"));

// Error Handler function
function errorHandler(err, req, res, next) {
  console.log("error handler function called");
  res.status(500);
  res.render("error", { error: err });
}

// Load routes
const movieRouter = require("./routes/movie.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const indexRouter = require("./routes/index.js");

app.use("/", indexRouter);
app.use("/api/movie", movieRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use(errorHandler);



//-------------------------------------

// //Oauth
// var passport = require("passport");
// var GithubStrategy = require("passport-github").Strategy;
// var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// passport.use(
//   new GithubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL:
//         "https://" +
//         process.env.PROJECT_DOMAIN +
//         ".glitch.me/login/github/return"
//     },
//     function(token, tokenSecret, profile, cb) {
//       return cb(null, profile);
//     }
//   )
// );
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });
// passport.deserializeUser(function(obj, done) {
//   done(null, obj);
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL:
//         "https://" +
//         process.env.PROJECT_DOMAIN +
//         ".glitch.me/login/google/return"
//     },
//     (token, refreshToken, profile, done) => {
//       return done(null, {
//         profile: profile,
//         token: token
//       });
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// // Use application-level middleware for common functionality, including
// // logging, parsing, and session handling.
// app.use(require("cookie-parser")());
// app.use(require("body-parser").urlencoded({ extended: true }));
// app.use(
//   require("express-session")({
//     secret: "keyboard cat",
//     resave: true,
//     saveUninitialized: true
//   })
// );

// // Initialize Passport and restore authentication state, if any, from the
// // session.
// app.use(passport.initialize());
// app.use(passport.session());

//----------------------------------------

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
