const wikiBot = require('./wikiBot')
const twitterBot = require('./twitterBot')

initBot = async function() {
  let todayQuery = `${new Date().toLocaleString('default', {
    month: 'long'
  })} ${new Date().getDate()}`

  await wikiBot.init(todayQuery).catch(err => {
    console.log(err)
  })

  twitterBot.init(wikiBot.contents)
}

module.exports = initBot
