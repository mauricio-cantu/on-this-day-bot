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
 * Ping necessario para fazer com que o servidor do app no Heroku não entre no modo sleep
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
 * Método principal inicial do bot. Carrega o conteúdo da Wikipedia e inicia o bot do Twitter.
 */
initBot.init = async function() {
  let todayQuery = `${new Date().toLocaleString('default', {
    month: 'long'
  })} ${new Date().getDate()}`

  console.log(
    `# initBot: ${todayQuery} (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`
  )

  await wikiBot.init(todayQuery).catch(err => {
    console.log('# fail loading content: ', err)
    process.exit()
  })

  twitterBot.init(wikiBot.contents, todayQuery)

  setTimeout(initBot.setPing, PING_INTERVAL)
}
