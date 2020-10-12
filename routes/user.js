// Route handlers
const express = require("express");
var passport = require("passport");
var session = require("express-session");
var multer = require("multer");
var formidable = require("formidable");
var fs = require("fs");
const router = express.Router();

//import data models
const User = require("../models/user.js");
const Movie = require("../models/movie.js");

// API about users

//Sign up
router.post("/signup", function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "public/img";
  form.parse(req, function(err, fields, files) {
    User.find({ username: fields["username"] }, function(err, user) {
      if (err) {
        return res.json({ ret_code: 2, ret_msg: "Sign up failed" });
      } else if (user == "") {
        let newUser = new User();
        newUser.username = fields["username"];
        newUser.password = fields["password"];
        var photopath = files["photo"].path;
        console.log(photopath);
        const photoData = fs.readFileSync(photopath);
        //newUser.photo.contentType = "image/png";
        var thumb = new Buffer(photoData).toString("base64");
        newUser.photo = thumb;
        newUser.save();
        console.log(newUser);
        res.redirect("/");
      } else {
        return res.json({ ret_code: 1, ret_msg: "This username is used" });
      }
    });
  });
});

//User Login, save the username in session
router.post("/login", function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user) {
    var sess = req.session;
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "login failed" });
    }
    if (user == null) {
      return res.json({ ret_code: 1, ret_msg: "Wrong username" });
    } else if (
      req.body.username == user.username &&
      req.body.password == user.password
    ) {
      req.session.loginUser = user;
      res.redirect("/");
    } else {
      return res.json({ ret_code: 1, ret_msg: "Wrong password" });
    }
  });
});

// user log out
router.get("/logout", function(req, res) {
  req.logout();
  req.session.loginUser = null;
  res.redirect("/");
});

// get a user
router.get("/profile/:userId", function(req, res, next) {
  User.findById(req.params.userId, function(err, user) {
    res.render("profile", {
      user: user
    });
  });
});

// update username
router.post("/updateUsername", function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user1) {
    if (!user1) {
      User.findOne({ username: req.session.loginUser.username }, function(
        err,
        user2
      ) {
        if (err) {
          return res.json({
            ret_code: 2,
            ret_msg: "Failed in finding this user"
          });
        } else {
          if (user2.username === req.body.username || user2 == "") {
            return res.json({
              ret_code: 1,
              ret_msg: "This is the same username"
            });
          } else {
            user2.username = req.body.username;
            user2.save();
            req.session.loginUser = user2;
             res.redirect("/");
          }
        }
      });
    } else {
      return res.json({
        ret_code: 2,
        ret_msg: "This username is already used"
      });
    }
  });
});

// update photo
router.post("/updatePhoto", function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "public/img";
  form.parse(req, function(err, fields, files) {
    User.findOne({ username: req.session.loginUser.username }, function(
      err,
      user
    ) {
      if (err) {
        return res.json({ ret_code: 2, ret_msg: "Cannot find the login user" });
      } else {
        //var photopath = files["photo"].path;
        //console.log(photopath);
        //user.photo.data = fs.readFileSync(photopath);
        //user.photo.contentType = "image/png";

        var photopath = files["photo"].path;
        //console.log(photopath);
        const photoData = fs.readFileSync(photopath);
        //newUser.photo.contentType = "image/png";
        var thumb = new Buffer(photoData).toString("base64");
        user.photo = thumb;
        user.save();
        //console.log(newUser);
        req.session.loginUser = user;
         res.redirect("/");
      }
    });
  });
  // }
  // });
});

// update password
router.post("/updatePassword", function(req, res, next) {
  console.log(req.session.loginUser);
  User.findOne({ username: req.session.loginUser.username }, function(
    err,
    user
  ) {
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "Failed in finding this user" });
    } else {
      if (user.password === req.body.password || user == "") {
        return res.json({ ret_code: 1, ret_msg: "This is the same password" });
      } else {
        user.password = req.body.password;
        user.save();
        req.logout();
        req.session.loginUser = null;
        res.redirect("/");
      }
    }
  });
});


//----------------------------------------
// on clicking "logoff" the cookie is cleared

// router.get("/logoff", function(req, res) {
//   req.session.destroy();
//   res.redirect("/");
// });

// router.get("/auth/github", passport.authenticate("github"));

// router.get(
//   "/login/github/return",
//   passport.authenticate("github", { failureRedirect: "/" }),
//   function(req, res) {
//     res.redirect("/success");
//   }
// );

// router.get(
//   "/success",
//   require("connect-ensure-login").ensureLoggedIn("/"),
//   function(req, res) {
//     res.header(
//       "Cache-Control",
//       "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
//     );
//     res.sendFile(__dirname + "/views/success.html");
//   }
// );

// router.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["https://www.googleapis.com/auth/userinfo.profile"]
//   })
// );

// router.get(
//   "/login/google/return",
//   passport.authenticate("google", {
//     failureRedirect: "/"
//   }),
//   function(req, res) {
//     res.redirect("/success");
//   }
// );

//----------------------------------------

module.exports = router;
