// Dependencies
var restful = require("node-restful");
var mongoose = restful.mongoose;

// Schema
var AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    required: true
  },
  recommends: [
    {
      movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie"
      }
    }
  ],
});

// Return model
module.exports = restful.model("Admin", AdminSchema);