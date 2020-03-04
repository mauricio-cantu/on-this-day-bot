const Twit = require('twit')
const { apiConfig } = require('./config')
var tweet = new Twit(apiConfig)

const twitterBot = {
  bot: tweet,
  onThisDayTweets: {
    events: [],
    births: [],
    deaths: []
  },
  init: function(sections) {
    this.parseContentToArray(sections)
    this.sliceTweets()
    this.manageContentTweets()
  },
  parseContentToArray: function(sections) {
    this.onThisDayTweets.births = sections.births.split('\n')
    this.onThisDayTweets.events = sections.events.split('\n')
    this.onThisDayTweets.deaths = sections.deaths.split('\n')
  },
  sliceTweets: function() {
    this.onThisDayTweets.events = this.onThisDayTweets.events.slice(
      this.onThisDayTweets.events.length - 5,
      this.onThisDayTweets.events.length
    )
    this.onThisDayTweets.births = this.onThisDayTweets.births.slice(
      this.onThisDayTweets.births.length - 5,
      this.onThisDayTweets.births.length
    )
    this.onThisDayTweets.deaths = this.onThisDayTweets.deaths.slice(
      this.onThisDayTweets.deaths.length - 5,
      this.onThisDayTweets.deaths.length
    )
  },
  manageContentTweets: function() {
    this.onThisDayTweets.events.forEach(this.applyRegex)
    this.onThisDayTweets.births.forEach(this.applyRegex)
    this.onThisDayTweets.deaths.forEach(this.applyRegex)
  },
  applyRegex: function(element, index, arr) {
    var matches = element.match(/((\d+)\s*–)/m)
    if (matches) {
      element = element.replace(matches[0], '').trim()
      element = `#OnThisDay in ${matches[2]}:\n ${element}`
      element = element.slice(0, 120)
      arr[index] = element
    }
  }
}

module.exports = twitterBot
