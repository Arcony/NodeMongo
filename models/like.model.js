let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let LikeSchema = new mongoose.Schema({
    
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        require: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        require: true
    },

    memeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
        require: true
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }
    
  })
  
  module.exports = mongoose.model('Like', LikeSchema)