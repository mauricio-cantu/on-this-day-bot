const wikiBot = require('./wikiBot')
const twitterBot = require('./twitterBot')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
const xhr = new XMLHttpRequest()
const {
  constants: { PING_INTERVAL }
} = require('../config')

initBot = async function() {
  let todayQuery = `${new Date().toLocaleString('default', {
    month: 'long'
  })} ${new Date().getDate()}`

  console.log('# initBot: ' + todayQuery)

  await wikiBot.init(todayQuery).catch(err => console.log(err))

  twitterBot.init(wikiBot.contents)

  setPing()
}

setPing = function() {
  xhr.open('get', process.env.baseUrl || 'http://localhost:3000', true)
  xhr.send()
  console.log('# ping')
  setTimeout(setPing, PING_INTERVAL)
}

module.exports = initBot
