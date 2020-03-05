/**
 * On This Day Bot for Twitter (@ThisDayBot)
 * Developed by Maurcio Cantu
 * github.com/mauricio-cantu
 * twitter.com/mauriciocantu_
 */

const initBot = require('./initBot')
const express = require('express')
const app = express()

app.get('*', (req, res) => {
  res.set('Content-Type', 'text/html')
  res.send(
    new Buffer(
      "<div style='padding: 30px;max-width: 500px; font-family: monospace;'>Hey there! This is the server for <b><a style='font-size: 20px;' href='http://twitter.com/ThisDayBot' target='blank'>@ThisDayBot</a></b> Twitter bot. Follow it to get to know historical facts that happened on the same current day but in other years.<br>Built by Mauricio Cantu, 2020.<br>GitHub: <a href='http://www.github.com/mauricio-cantu'> github.com/mauricio-cantu</a></div>"
    )
  )
})

app.listen(3000)

initBot()
