// Dependencies
var restful = require("node-restful");
var mongoose = restful.mongoose;

// Schema
var MovieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: false
  },
  description: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },  
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      userPhoto:{
        type: Buffer,
      },
      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      content: String,
      rating: {
        type: Number,
        min: 0,
        max: 10
      }
    }
  ],
  reviewCount: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number
  }
});

// Return model
module.exports = restful.model("Movie", MovieSchema);
