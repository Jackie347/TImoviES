// Route handlers
const express = require("express");
const router = express.Router();
var session = require("express-session");
var fs = require("fs");

//import data models
const Admin = require("../models/admin.js");
const Movie = require("../models/movie.js");
var formidable = require("formidable");

// API about admins

//Admin Login, save the username in session
router.post("/login", function(req, res, next) {
  Admin.findOne({ username: req.body.username }, function(err, admin) {
    var sess = req.session;
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "login failed" });
    }
    // console.log(admin);
    if (admin == null) {
      return res.json({ ret_code: 1, ret_msg: "Wrong username" });
    } else if (
      req.body.username == admin.username &&
      req.body.password == admin.password
    ) {
      req.session.loginAdmin = admin;
      //console.log(req.session.loginAdmin);
      res.redirect("/api/admin/manage");
    } else {
      return res.json({ ret_code: 1, ret_msg: "Wrong password" });
    }
  });
});

// admin log out
router.get("/logout", function(req, res) {
  req.logout();
  req.session.loginAdmin = null;
  res.redirect("/admin");
});

//get admin manage page
router.get("/manage", function(req, res) {
  Movie.find({}).exec(function(err, movies) {
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "Get movies failed" });
    } else {
      var temp_languages = [];
      for (var i = 0; i < movies.length; i++) {
        var temp = movies[i].language;
        var temp2 = temp.split(";");
        for (var j = 0; j < temp2.length; j++) {
          var json = { language: temp2[j].trim() };
          temp_languages.push(json);
        }
      }
      var languages = [];
      for (var i = 0, l = temp_languages.length; i < l; i++) {
        for (var j = i + 1; j < l; j++)
          if (temp_languages[i].language == temp_languages[j].language)
            j == ++i;
        languages.push(temp_languages[i]);
      }
      var temp_years = [];
      for (var i = 0; i < movies.length; i++) {
        var temp = movies[i].releaseDate.getFullYear();
        var json = { year: temp };
        temp_years.push(json);
      }
      var years = [];
      for (var i = 0, l = temp_years.length; i < l; i++) {
        for (var j = i + 1; j < l; j++)
          if (temp_years[i].year == temp_years[j].year) j == ++i;
            years.push(temp_years[i]);
      }
      res.render("manage", {
        movies: movies,
        query: "",
        releaseYear: "All",
        language: "All",
        languages: languages,
        years: years
      });
    }
  });
});

//render new movie page
router.get("/addMovie", function(req, res) {
  res.status(201).render("newMovie");
});

//Create a new movie
router.post("/createMovie", function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "public/img";
  form.parse(req, function(err, fields, files) {
    Movie.findOne({ name: req.body.name }, function(err, movie) {
      if (err) {
        return res.json({ ret_code: 2, ret_msg: "Insert movie failed" });
      } else if (movie) {
        return res.json({ ret_code: 1, ret_msg: "This movie already exists" });
      } else {
        let newMovie = new Movie();
        newMovie.name = fields["name"];
        newMovie.releaseDate = fields["date"];
        newMovie.duration = fields["duration"];
        newMovie.language = fields["language"];
        newMovie.director = fields["director"];
        newMovie.description = fields["description"];
        var posterPath = files["post"].path;
       // console.log(posterPath);
        const posterData = fs.readFileSync(posterPath);
        var thumb = new Buffer(posterData, "binary").toString("base64");
        newMovie.poster = thumb;
        newMovie.save();
        res.redirect("/api/admin/manage");
      }
    });
  });
});

// get a movie
router.get("/movie/:movieId", function(req, res, next) {
  Movie.findById(req.params.movieId, function(err, movie) {
    var releaseDate = movie.releaseDate;
    var date = (releaseDate.getMonth() + 1) + "/" + releaseDate.getDate() + "/" + releaseDate.getFullYear();
    res.render("updateMovie", {
      movie: movie,
      date: date
    });
  });
});

//Update movie
router.post("/updateMovie/:movieId", function(req, res, next) {
  Movie.findById(req.params.movieId, function(err, movie) {
    if (err) {
      res.redirect("/api/admin/updateMovie");
    } else {
      movie.name = req.body.name;
      movie.releaseDate = req.body.date;
      movie.duration = req.body.duration;
      movie.language = req.body.language;
      movie.director = req.body.director;
      movie.description = req.body.description;
      movie.save();
      res.redirect("/api/admin/manage");
    }
  });
});

//Delete a movie
router.delete("/deleteMovie/:movieId", function(req, res) {
  Movie.findById(req.params.movieId, function(err, movie) {
    if (err) return res.json({ ret_code: 2, ret_msg: "Delete movie failed" });
    else {
        Admin.findOne({ username: req.session.loginAdmin.username }, function(
    err,
    admin
  ) {
    const tempArray1 = admin.recommends;
    for (var i = 0; i < tempArray1.length; i++) {
      if (String(tempArray1[i].userId) == String(movie.movieId)) {
        tempArray1.splice(i, 1);
      }
    }
    admin.recommends = tempArray1;
    admin.save();
    movie.remove();
    res.redirect("/api/admin/manage");
    }
                     )
    }
  });
});

//get admin pick page
router.get("/pick", function(req, res) {
  Admin.findOne({ username: req.session.loginAdmin.username })
    .populate({
      path: "recommends.movieId"
    })
    .exec(function(err, movies) {
      res.render("pick", {
        movies: movies.recommends
      });
    });
});

// pick one movie to recommended list
router.get("/pickone/:movieId", function(req, res, next) {
  Admin.findOne({ username: req.session.loginAdmin.username }, function(
    err,
    admin
  ) {
    const tempArray1 = admin.recommends;
    for (var i = 0; i < tempArray1.length; i++) {
      if (String(tempArray1[i]._id) == String(req.params.movieId)) {
        return res.json({
          ret_code: 1,
          ret_msg: "This movie is already picked"
        });
      }
    }
    var jsonObject1 = {
      movieId: req.params.movieId
    };
    // console.log(tempArray1)
    tempArray1.push(jsonObject1);
    admin.recommends = tempArray1;
    // console.log(tempArray1)
    admin.save();
    res.redirect("/api/admin/pick");
  });
});

//Delete a pick
router.get("/deletePick/:movieId", function(req, res) {
  Admin.findOne({ username: req.session.loginAdmin.username }, function(
    err,
    admin
  ) {
    const tempArray1 = admin.recommends;
    //console.log(tempArray1);
    for (var i = 0; i < tempArray1.length; i++) {
      // console.log(tempArray1[i].movieId);
      // console.log(req.params.movieId);
      if (String(tempArray1[i]._id) == String(req.params.movieId)) {
        tempArray1.splice(i, 1);
      }
    }
    admin.recommends = tempArray1;
    admin.save();
    res.redirect("/api/admin/pick");
  });
});

//adminSearch
router.post("/search", function(req, res, next) {
  var query = req.body.query;
  var releaseYear = req.body.releaseYear;
  var language = req.body.language;
  if (releaseYear != "") {
    var date1 = releaseYear + "-01-01";
    var date2 = releaseYear + "-12-31";
  } else {
    var date1 = "500-01-01";
    var date2 = "3000-01-01";
  }
  //console.log(date1);
 // console.log(date2);

  Movie.find({
    $and: [
      { name: { $regex: req.body.query, $options: "i" } },
      { releaseDate: { $gte: new Date(date1), $lte: new Date(date2) } },
      { language: { $regex: req.body.language, $options: "i" } }
    ]
  }).exec(function(err, results) {
    console.log(results);
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "Get movies failed" });
    } else {
      Movie.find({}).exec(function(err, movies) {
        if (err) {
          return res.json({ ret_code: 2, ret_msg: "Get movies failed" });
        } else {
          var temp_languages = [];
          for (var i = 0; i < movies.length; i++) {
            var temp = movies[i].language;
            var temp2 = temp.split(";");
            for (var j = 0; j < temp2.length; j++) {
              var json = { language: temp2[j].trim() };
              temp_languages.push(json);
            }
          }
          var languages = [];
          for (var i = 0, l = temp_languages.length; i < l; i++) {
            for (var j = i + 1; j < l; j++)
              if (temp_languages[i].language == temp_languages[j].language)
                j == ++i;
            languages.push(temp_languages[i]);
          }
          var temp_years = [];
          for (var i = 0; i < movies.length; i++) {
            var temp = movies[i].releaseDate.getFullYear();
            var json = { year: temp };
            temp_years.push(json);
          }
          var years = [];
          for (var i = 0, l = temp_years.length; i < l; i++) {
            for (var j = i + 1; j < l; j++)
              if (temp_years[i].year == temp_years[j].year) j == ++i;
            years.push(temp_years[i]);
          }
          if (releaseYear == "") {
            releaseYear = "All";
          }
          if (language == "") {
            language = "All";
          }
          res.render("manage", {
            movies: results,
            query: query,
            releaseYear: releaseYear,
            language: language,
            languages: languages,
            years: years
          });
        }
      });
    }
  });
});

module.exports = router;
