let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let PostSchema = new mongoose.Schema({
    
    title: {
      type: String,
      require: true
    },
    content: {
      type: String,
      require: true
    },
    tag: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        require: true
    }

    
  })
  
  module.exports = mongoose.model('Post', PostSchema)