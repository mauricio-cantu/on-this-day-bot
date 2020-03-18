/**
 * 'On This Day Bot' Twitter Bot (@ThisDayBot)
 * Developed by Maurcio Cantu
 * github.com/mauricio-cantu
 * twitter.com/mauriciocantu_
 * twitter.com/ThisDayBot
 */

require('dotenv').config()
const initBot = require('./src/bots/initBot')
const initWebhook = require('./src/twitter-webhook')
const express = require('express')
const mongoose = require('mongoose')
const app = express()

;(async () => {
  // conects to mongoDB
  await mongoose
    .connect(process.env.DB_CONN_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .catch(err => console.log('# error connecting to db ', err))

  // defines a simple view for any route on server
  app.get('/*', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(
      new Buffer(
        "<div style='padding: 30px;max-width: 500px; font-family: monospace;'>Hey there! This is the server for <b><a style='font-size: 20px;' href='http://twitter.com/ThisDayBot' target='blank'>@ThisDayBot</a></b> Twitter bot. Follow it to get to know historical facts that happened on the same current day but in other years.<br>Built by Mauricio Cantu, 2020.<br>GitHub: <a href='http://www.github.com/mauricio-cantu'> github.com/mauricio-cantu</a></div>"
      )
    )
  })

  app.listen(process.env.PORT || 3000)

  // setup webhook to listen to interaction events with the bot account
  await initWebhook()

  // initialize bot
  await initBot.init()
})()
