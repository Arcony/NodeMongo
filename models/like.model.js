let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let LikeSchema = new mongoose.Schema({
    
    postId: {
        type: Number,
        require: true
    },

    userId: {
        type: Number,
        require: true
    },

    memeId: {
        type: Number,
        require: true
    },
    
  })
  
  module.exports = mongoose.model('Like', LikeSchema)