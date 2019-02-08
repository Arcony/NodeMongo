let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let MemeSchema = new mongoose.Schema({
    
    title: {
      type: String,
      require: true
    },
    content: {
        type: String,
        required: true
    },
    tag: {
        type: String,
    },
    userId: {
        type:String,
        require: true
    },
    postId: {
        type: String,
        require: true
    }
    
  })
  
  module.exports = mongoose.model('Meme', MemeSchema)