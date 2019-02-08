let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let CommentSchema = new mongoose.Schema({
    
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
    text: {
        type: String,
        require: true
    }
    
  })
  
  module.exports = mongoose.model('Comment', CommentSchema)