// Route handlers
const express = require("express");
const router = express.Router();

const Movie = require("../models/movie.js");
const Admin = require("../models/admin.js");

//Get index page
router.get("/", function(req, res, next) {
  Movie.find({})
    .sort({ releaseDate: -1 })
    .limit(10)
    .exec(function(err, sortedMoviesByDate) {
      if (err) {
        return res.json({ ret_code: 2, ret_msg: "Get movies failed" });
      }
      Admin.findOne({})
        .populate({
          path: "recommends.movieId"
        })
        .exec(function(err, movies) {
          //console.log(movies);
          res.render("index", {
            top: movies.recommends,
            year: sortedMoviesByDate
          });
        });
    });
});

//get signup page
router.get("/signup", function(req, res) {
  res.status(200);
  res.render("signup");
});

//get signin page
router.get("/signin", function(req, res) {
  res.status(200);
  res.render("signin");
});

//get admin index page
router.get("/admin", function(req, res) {
  res.status(200);
  res.render("admin");
});

module.exports = router;
