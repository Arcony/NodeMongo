let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let LikeSchema = new mongoose.Schema({
    
    postId: {
        type: String,
        require: true
    },

    userId: {
        type: String,
        require: true
    },

    memeId: {
        type: String,
        require: true
    },

    commentId: {
        type: String,
    }
    
  })
  
  module.exports = mongoose.model('Like', LikeSchema)