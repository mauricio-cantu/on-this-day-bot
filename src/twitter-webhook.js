const { Autohook } = require('twitter-autohook')
const twitterBot = require('./bots/twitterBot')

module.exports = async start => {
  try {
    const webhook = new Autohook()

    webhook.port = process.env.WEBHOOK_PORT || 1337

    // Removes existing webhooks
    await webhook.removeWebhooks()

    webhook.on('event', async event => {
      if (event.follow_events) {
        console.log(
          `# follow event received (${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()})`
        )
        let username = `@${event.follow_events[0].source.screen_name}`
        twitterBot.replyOnFollow(username)
      }
    })

    // Starts a server and adds a new webhook
    await webhook.start()

    // Subscribes to your own user's activity
    await webhook.subscribe({
      oauth_token: process.env.TWITTER_ACCESS_TOKEN,
      oauth_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })
  } catch (e) {
    // Display the error and quit
    console.error(e)
    process.exit(1)
  }
}
