const twitterBot = {}
module.exports = twitterBot

const Twit = require('twit')
const initBot = require('./initBot')
const apiConfig = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
}
const {
  constants: { HASHTAG, MAX_CHARACTERS, INTERVAL_TWEETS }
} = require('../config')

twitterBot.bot = new Twit(apiConfig)

twitterBot.onThisDayTweets = []

twitterBot.init = function(sections) {
  this.actualDay = new Date().getDate()
  this.onThisDayTweets.events = []
  this.onThisDayTweets.births = []
  this.onThisDayTweets.deaths = []
  this.handleEventsTweets(sections.events.split('\n'))
  this.handleBirthTweets(sections.births.split('\n'))
  this.handleDeathTweets(sections.deaths.split('\n'))

  this.startTweetsSchedule()
}

twitterBot.handleEventsTweets = function(array) {
  this.onThisDayTweets.events = array
  this.onThisDayTweets.events.forEach(this.applyRegex)
}

twitterBot.handleDeathTweets = function(array) {
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
      finalTweet.slice(0, MAX_CHARACTERS).concat('...')
    }
    this.onThisDayTweets.deaths.push(finalTweet)

    tweetComp = ''
  }
}

twitterBot.handleBirthTweets = function(array) {
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
      finalTweet.slice(0, MAX_CHARACTERS).concat('...')
    }
    this.onThisDayTweets.births.push(finalTweet)

    tweetComp = ''
  }
}

twitterBot.applyRegex = function(element, index, arr) {
  let matches = element.match(/((\d+)\s*–)/m)
  if (matches) {
    element = element.replace(matches[0], '').trim()
    element = `${HASHTAG} in ${matches[2]} 📖:\n${element}`
    if (element.length > MAX_CHARACTERS) {
      element.slice(0, MAX_CHARACTERS).concat('...')
    }
    arr[index] = element
  } else {
    arr.splice(index, 1)
  }
}

let timeOutFn
twitterBot.startTweetsSchedule = async function() {
  if (twitterBot.dayHasChanged()) {
    console.log('day has changed')
    clearTimeout(timeOutFn)
    initBot.init()
    return
  }

  if (twitterBot.hasTweets()) {
    let tweeted
    do {
      tweeted = true
      // 0 - events, 1 - births, 2 - deaths
      let choice = twitterBot.getRandomOption()

      let tweet
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

      if (tweet[0]) {
        // await twitterBot.bot
        //   .post('statuses/update', { status: tweet[0] })
        //   .catch(err => {
        //     tweeted = false
        //     console.log('# tweet error: ', err.message)
        //   })
      } else break
    } while (!tweeted)
  } else {
    console.log('# contents array is empty')
  }
  timeOutFn = setTimeout(twitterBot.startTweetsSchedule, INTERVAL_TWEETS)
}

twitterBot.getRandomOption = function() {
  if (
    this.onThisDayTweets.events.length != 0 &&
    this.onThisDayTweets.births.length == 0 &&
    this.onThisDayTweets.deaths.length == 0
  )
    return 0

  if (
    this.onThisDayTweets.events.length == 0 &&
    this.onThisDayTweets.births.length != 0 &&
    this.onThisDayTweets.deaths.length == 0
  )
    return 1

  if (
    this.onThisDayTweets.events.length == 0 &&
    this.onThisDayTweets.births.length == 0 &&
    this.onThisDayTweets.deaths.length != 0
  )
    return 2

  let n = Math.floor(Math.random() * 100 + 1)

  if (n <= 70) {
    return 0 // events
  } else if (n <= 85) {
    return 1 // births
  } else {
    return 2 // deaths
  }
}

twitterBot.dayHasChanged = function() {
  return new Date().getDate() != twitterBot.actualDay
}

twitterBot.hasTweets = function() {
  return (
    twitterBot.onThisDayTweets.events.length != 0 ||
    twitterBot.onThisDayTweets.births.length != 0 ||
    twitterBot.onThisDayTweets.deaths.length != 0
  )
}

twitterBot.replyOnFollow = function(username) {
  this.bot
    .post('statuses/update', {
      status: `Hey ${username}, thanks for following! 🤗\nThis day will be marked in history!`
    })
    .catch(err => console.log('# reply error: ', err.message))
}
