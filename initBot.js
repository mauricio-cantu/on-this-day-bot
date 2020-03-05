const wikiBot = require('./wikiBot')
const twitterBot = require('./twitterBot')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
const xhr = new XMLHttpRequest()
const PING_INTERVAL = 28 * 60000

initBot = async function() {
  console.log('# initBot')

  let todayQuery = `${new Date().toLocaleString('default', {
    month: 'long'
  })} ${new Date().getDate()}`

  await wikiBot.init(todayQuery).catch(err => console.log(err))

  twitterBot.init(wikiBot.contents)

  ping()
}

ping = function() {
  xhr.open('get', process.env.baseUrl || 'http://localhost:3000', true)
  xhr.send()
  console.log('# keep alive')
  setTimeout(ping, PING_INTERVAL)
}

module.exports = initBot
