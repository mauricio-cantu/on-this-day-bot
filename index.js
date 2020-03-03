const wikiBot = require('./wikiBot')

let todayQuery = `${new Date().toLocaleString('default', {
  month: 'long'
})} ${new Date().getDate()}`

wikiBot.init(todayQuery)
