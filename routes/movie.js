// Route handlers
const express = require("express");
const router = express.Router();
const Base64 = require("js-base64");

//import data models
const Movie = require("../models/movie.js");
const User = require("../models/user.js");

//function to get the rating
function getRating(array) {
  if (array.length == 0) return 0;
  var j = 0;
  var sum = 0;
  for (var i = 0; i < array.length; i++) {
    sum += array[i].rating;
    j++;
  }
  return (sum / j).toFixed(1);
}

function formatDate(timestamp) {
  var x = new Date(timestamp);
  var dd = x.getDate();
  var mm = x.getMonth() + 1;
  var yy = x.getFullYear();
  return dd + "/" + mm + "/" + yy;
}

// API about movies

//Get a movie Info
router.get("/one/:movieId", function(req, res, next) {
  Movie.findById(req.params.movieId)
    .populate({
      path: "reviews.userId"
    })
    .exec(function(err, movie) {
   // console.log(movie);
      var releaseDate = movie.releaseDate;
      var date = (releaseDate.getMonth() + 1) + "/" + releaseDate.getDate() + "/" + releaseDate.getFullYear();
      res.render("movie", {
        movie: movie,
        date: date
      });
    });
});

// search movies
router.post("/search", function(req, res, next) {
  var query = req.body.query;
  var sort = req.query.sort;
  Movie.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { director: { $regex: query, $options: "i" } }
    ]
  }).sort(sort).exec(function(err, movies) {
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "Get movies failed" });
    } else {
      res.render("browse", {
        movies: movies,
        param: sort,
        query: query
      });
    }
  });
});

//Create a new review for the certain movie, then update the two collections
router.post("/createReview/:movieId", function(req, res, next) {
  User.findOne({ username: req.session.loginUser.username }, function(
    err,
    user
  ) {
    if (err) {
      return res.json({ ret_code: 2, ret_msg: "Failed in finding this user" });
    } else {
      Movie.findById(req.params.movieId, function(err, movie) {
        if (err) {
          return res.json({
            ret_code: 2,
            ret_msg: "Failed in finding the movie"
          });
        } else {
          //console.log(user);
          const tempArray1 = user.reviews;
          const tempArray2 = movie.reviews;
          for (var i = 0; i < tempArray2.length; i++) {
            if (String(tempArray2[i].userId) == String(user._id)) {
              return res.json({
                ret_code: 1,
                ret_msg: "You have created a review for this movie"
              });
            }
          }
          var jsonObject1 = {
            content: req.body.content,
            rating: req.body.rating,
            movieId: movie._id
          };
          tempArray1.push(jsonObject1);

          var jsonObject2 = {
            content: req.body.content,
            rating: req.body.rating,
            userId: user._id
          };
          tempArray2.push(jsonObject2);
          var calculatedRating = getRating(tempArray2);
          // user.reviews = tempArray1;
          // movie.reviews = tempArray2;
          // movie.rating=calculatedRating;
          // movie.reviewCount=tempArray2.length;
          // user.save();
          // movie.save();
          User.updateOne(
            { username: req.session.loginUser.username },
            { reviews: tempArray1 },
            function(err) {
              if (err) {
                return res.json({
                  ret_code: 2,
                  ret_msg: "Failed in updating the review in user table"
                });
              } else {
                Movie.updateOne(
                  { _id: req.params.movieId },
                  {
                    rating: calculatedRating,
                    reviews: tempArray2,
                    reviewCount: tempArray2.length
                  },
                  function(err) {
                    if (err) {
                      // return console.log(err);
                      return res.json({
                        ret_code: 2,
                        ret_msg: "Failed in updating the review in movie table "
                      });
                    } else {
                      res.redirect("/api/movie/one/" + req.params.movieId);
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });
});

module.exports = router;
