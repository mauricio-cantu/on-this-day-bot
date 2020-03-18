const initBot = {}
module.exports = initBot

const wikiBot = require('./wikiBot')
const twitterBot = require('./twitterBot')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
const xhr = new XMLHttpRequest()
const {
  constants: { PING_INTERVAL }
} = require('../config')

/**
 * Ping to keep Heroku server awake. It sleeps if the app doesn't receive any request within 30 minutes.
 */
initBot.setPing = function() {
  xhr.open('get', process.env.baseUrl || 'http://localhost:3000', true)
  xhr.send()
  console.log(
    `# ping (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`
  )
  setTimeout(initBot.setPing, PING_INTERVAL)
}
/**
 * Bot's main method. Load Wiki content and init the Twitter bot.
 */
initBot.init = async function() {
  // query which will be used to search for contents of current day
  let todayQuery = `${new Date().toLocaleString('default', {
    month: 'long'
  })} ${new Date().getDate()}`

  // debug log
  console.log(
    `# initBot: ${todayQuery} (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`
  )
  // search contents on wiki
  await wikiBot.init(todayQuery).catch(err => {
    console.log('# fail loading content: ', err)
    process.exit()
  })

  // initialize Twitter Bot with contents of today
  twitterBot.init(wikiBot.contents, todayQuery)

  // starts ping
  setTimeout(initBot.setPing, PING_INTERVAL)
}
