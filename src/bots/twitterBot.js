const twitterBot = {}
module.exports = twitterBot

const Twit = require('twit')
const initBot = require('./initBot')
const Tweet = require('../models/Tweet')

const apiConfig = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

const {
  constants: { HASHTAG, MAX_CHARACTERS, INTERVAL_TWEETS }
} = require('../config')

twitterBot.bot = new Twit(apiConfig)
twitterBot.onThisDayTweets = []

twitterBot.init = function(sections, todayQuery) {
  // store current day for control
  this.currentDay = new Date().getDate()
  this.todayQuery = todayQuery
  // clear contents from last day
  this.onThisDayTweets.events = []
  this.onThisDayTweets.births = []
  this.onThisDayTweets.deaths = []
  // handle each type of content
  this.handleEventsTweets(sections.events.split('\n'))
  this.handleBirthTweets(sections.births.split('\n'))
  this.handleDeathTweets(sections.deaths.split('\n'))

  this.startTweetsSchedule()
}

twitterBot.handleEventsTweets = function(array) {
  // store event contents in the bot tweets array
  this.onThisDayTweets.events = array
  // make some changes in text to turn it properly for tweeting
  this.onThisDayTweets.events.forEach(this.applyRegex)
}

twitterBot.handleDeathTweets = function(array) {
  // 'top' text of every tweet about deaths
  let tweetInitial = `People who died ${HASHTAG} (${twitterBot.todayQuery}) 💀\nPress F (or don't depending on who it was! 🤷)\n`
  let tweetComp = ''
  let finalTweet = ''
  // prepare tweets about deaths making a list of three for each tweet
  while (array.length > 0) {
    array.splice(0, 3).forEach(element => {
      element = element.replace(/(\s*–)/m, ' –')
      tweetComp += `${element}\n`
    })
    // concats the list with the top text
    finalTweet = `${tweetInitial}${tweetComp}`
    if (finalTweet.length > MAX_CHARACTERS) {
      finalTweet.slice(0, MAX_CHARACTERS).concat('...')
    }
    this.onThisDayTweets.deaths.push(finalTweet)

    tweetComp = ''
  }
}

twitterBot.handleBirthTweets = function(array) {
  // 'top' text of every tweet about births
  let tweetInitial = `People who were born ${HASHTAG} in history (${twitterBot.todayQuery}) 👶\n`
  let tweetComp = ''
  let finalTweet = ''
  // prepare tweets about births making a list of three for each tweet
  while (array.length > 0) {
    array.splice(0, 3).forEach(element => {
      element = element.replace(/(\s*–)/m, ' –')
      tweetComp += `${element}\n`
    })
    // concats the list with the top text
    finalTweet = `${tweetInitial}${tweetComp}`
    if (finalTweet.length > MAX_CHARACTERS) {
      finalTweet.slice(0, MAX_CHARACTERS).concat('...')
    }
    this.onThisDayTweets.births.push(finalTweet)

    tweetComp = ''
  }
}

twitterBot.applyRegex = function(element, index, arr) {
  // tries to capture the year which the event ocurred
  let matches = element.match(/((\d+)\s*–)/m)
  // if found, creates the text to be tweeted
  if (matches) {
    element = element.replace(matches[0], '').trim()
    element = `${HASHTAG} in ${matches[2]} (${twitterBot.todayQuery}) 📖:\n${element}`
    if (element.length > MAX_CHARACTERS) {
      element.slice(0, MAX_CHARACTERS).concat('...')
    }
    arr[index] = element
  } else {
    // deletes from contents array if no pattern is found
    arr.splice(index, 1)
  }
}

let timeOutFn
// starts the routine of tweeting every N minutes, according to the value defined in INTERVAL_TWEETS
twitterBot.startTweetsSchedule = async function() {
  // updates bot to the new day
  if (twitterBot.dayHasChanged()) {
    console.log('day has changed')
    // delete the timeout for the next scheduled tweet
    clearTimeout(timeOutFn)
    // deletes of db tweets from last day, since now they are useless
    await Tweet.deleteMany({ dayLabel: twitterBot.todayQuery })
    // reinit bot
    initBot.init()
    return
  }

  // checks if there are tweets available yet
  if (twitterBot.hasTweets()) {
    let tweeted
    do {
      tweeted = true
      // 0 - events, 1 - births, 2 - deaths
      let choice = twitterBot.getRandomOption()

      let tweet
      // gets random index to get the tweet from bot tweets array
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
      // checks if there are a existing tweet
      if (tweet[0]) {
        // checks if it has already been tweeted earlier
        let tweetExists = await Tweet.findOne({
          content: tweet[0],
          dayLabel: twitterBot.todayQuery
        })

        if (!tweetExists) {
          // post content to twitter
          await twitterBot.bot
            .post('statuses/update', { status: tweet[0] })
            .catch(err => {
              tweeted = false
              console.log(
                `# tweet error: (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`,
                err.message
              )
            })
          // created db record if successful
          if (tweeted) {
            await Tweet.create({
              content: tweet[0],
              dayLabel: twitterBot.todayQuery
            })
          }
        } else {
          tweeted = false
        }
      } else {
        console.log(
          `# tweet undef (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`
        )
        break
      }
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
  return new Date().getDate() != twitterBot.currentDay
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
    .catch(err =>
      console.log(
        `# reply error: (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`,
        err.message
      )
    )
}
