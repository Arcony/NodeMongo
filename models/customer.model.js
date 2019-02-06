let mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/nodemongo'

mongoose.connect(mongoDB);

let CustomerSchema = new mongoose.Schema({
    
    username: {
      type: String,
      require: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    picture: {
      type: String
    },
    isAdmin: {
      type: Boolean,
      require: true,
      default: 0
    }
  })
  
  module.exports = mongoose.model('Customer', CustomerSchema)