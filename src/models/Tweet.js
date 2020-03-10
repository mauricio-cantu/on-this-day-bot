const mongoose = require('mongoose')

const TweetSchema = new mongoose.Schema({
  content: String,

  dayLabel: {
    type: String,
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Tweet', TweetSchema)
