let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let NotificationSchema = new mongoose.Schema({
    
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        require: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },

    memeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },

    likeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like',
    }
    
  })
  
  module.exports = mongoose.model('Notification', NotificationSchema)