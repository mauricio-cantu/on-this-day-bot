const Twit = require('twit')
const initBot = require('./initBot')
const { apiConfig } = require('./config')
const HASHTAG = '#OnThisDay'
const MAX_CHARACTERS = 280
const INTERVAL_TWEETS = 15 * 60000
let actualDay = new Date().getDate()

const twitterBot = {
  bot: new Twit(apiConfig),

  onThisDayTweets: [],

  init: function(sections) {
    this.onThisDayTweets.events = []
    this.onThisDayTweets.births = []
    this.onThisDayTweets.deaths = []
    this.handleEventsTweets(sections.events.split('\n'))
    this.handleBirthTweets(sections.births.split('\n'))
    this.handleDeathTweets(sections.deaths.split('\n'))
    this.startTweetsSchedule()
  },

  handleEventsTweets: function(array) {
    this.onThisDayTweets.events = array
    this.onThisDayTweets.events.forEach(this.applyRegex)
  },

  handleDeathTweets: function(array) {
    let tweetInitial = `People who died ${HASHTAG} 💀\nPress F (or don't depending on who it was! 🤷)\n`
    let tweetComp = ''
    let finalTweet = ''
    while (array.length > 0) {
      array.splice(0, 3).forEach(element => {
        element = element.replace(/(\s*–)/m, ' –')
        tweetComp += `${element}\n`
      })
      finalTweet = `${tweetInitial}${tweetComp}`
      if (finalTweet.length > MAX_CHARACTERS) {
        finalTweet.slice(0, MAX_CHARACTERS - 3).concat('...')
      }
      this.onThisDayTweets.deaths.push(finalTweet)

      tweetComp = ''
    }
  },

  handleBirthTweets: function(array) {
    let tweetInitial = `People who were born ${HASHTAG} in history 👶\n`
    let tweetComp = ''
    let finalTweet = ''
    while (array.length > 0) {
      array.splice(0, 3).forEach(element => {
        element = element.replace(/(\s*–)/m, ' –')
        tweetComp += `${element}\n`
      })
      finalTweet = `${tweetInitial}${tweetComp}`
      if (finalTweet.length > MAX_CHARACTERS) {
        finalTweet.slice(0, MAX_CHARACTERS - 3).concat('...')
      }
      this.onThisDayTweets.births.push(finalTweet)

      tweetComp = ''
    }
  },

  applyRegex: function(element, index, arr) {
    let matches = element.match(/((\d+)\s*–)/m)
    if (matches) {
      element = element.replace(matches[0], '').trim()
      element = `${HASHTAG} in ${matches[2]} 📖:\n${element}`
      if (element.length > MAX_CHARACTERS) {
        element.slice(0, MAX_CHARACTERS - 3).concat('...')
      }
      arr[index] = element
    } else {
      arr.splice(index, 1)
    }
  },

  startTweetsSchedule: function() {
    let today = new Date().getDate()
    if (today != actualDay) {
      actualDay = today
      initBot()
    }
    let tweeted = false
    do {
      // 0 - events, 1 - births, 2 - deaths
      let choice = twitterBot.getRandomChoice()
      let tweet = ''
      switch (choice) {
        case 0:
          randomIndex = Math.floor(
            Math.random() * (twitterBot.onThisDayTweets.events.length - 1)
          )
          tweet = twitterBot.onThisDayTweets.events.splice(randomIndex, 1)
          break
        case 1:
          randomIndex = Math.floor(
            Math.random() * (twitterBot.onThisDayTweets.births.length - 1)
          )
          tweet = twitterBot.onThisDayTweets.births.splice(randomIndex, 1)
          break
        case 2:
          randomIndex = Math.floor(
            Math.random() * (twitterBot.onThisDayTweets.deaths.length - 1)
          )
          tweet = twitterBot.onThisDayTweets.deaths.splice(randomIndex, 1)
          break
      }
      tweeted = twitterBot.makeTweet(tweet[0])
    } while (!tweeted)

    setTimeout(twitterBot.startTweetsSchedule, INTERVAL_TWEETS)
  },

  getRandomChoice: function() {
    let n = Math.floor(Math.random() * 101)
    if (n >= 0 && n <= 70) {
      return 0 // events
    } else if (n <= 85) {
      return 1 // births
    } else {
      return 2 // deaths
    }
  },

  makeTweet: function(text) {
    let posted = false
    this.bot.post('statuses/update', { status: text }, (err, data, res) => {
      posted = err
      if (err) console.log('# tweet error:\n', data)
    })
    return !posted
  }
}

module.exports = twitterBot
