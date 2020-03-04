const wikiBot = require('./wikiBot')
const twitterBot = require('./twitterBot')

let todayQuery = `${new Date().toLocaleString('default', {
  month: 'long'
})} ${new Date().getDate()}`

wikiBot.init(todayQuery).then(() => {
  twitterBot.init(wikiBot.contents)

  // TODO: desenvolver rotinas para twittar de tempo em tempo
  // twitterBot.onThisDayTweets.events.forEach(element => {
  //   twitterBot.bot.post('statuses/update', {
  //     status: element
  //   })
  // })
})
