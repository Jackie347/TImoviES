// Dependencies
var restful = require("node-restful");
var mongoose = restful.mongoose;

// Schema
var UserSchema = new mongoose.Schema({
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
    // data: Buffer, 
    // contentType: String 
    type: String,
    required: true
  },
  reviews: [
    {
      movieId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Movie"
      },
      content: String,
      rating: {
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,10]
      }
    }
  ],
});


// Return model
module.exports = restful.model("User", UserSchema);