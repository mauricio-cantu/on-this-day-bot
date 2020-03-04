const wiki = require('wikijs').default

// let todayQuery = `${new Date().toLocaleString('default', {
//   month: 'long'
// })} ${new Date().getDate()}`

let apiResp

const wikiBot = {
  contents: {
    events: {},
    births: {},
    deaths: {}
  },

  init: function(query) {
    return new Promise(function(fullfilled, reject) {
      wiki()
        .search(query, 1)
        .then(data =>
          wiki()
            .page(data.results[0])
            .then(page =>
              page.sections().then(sections => (apiResp = sections))
            )
        )
        .then(() => {
          wikiBot.categorize(apiResp)
          fullfilled(true)
        })
        .catch(err => {
          reject(true)
          console.log(err)
        })
    })
  },

  categorize: function(sections) {
    for (section of sections) {
      if (section.title == 'Events') {
        this.contents.events = section.content
      } else if (section.title == 'Births') {
        this.contents.births = section.content
      } else if (section.title == 'Deaths') {
        this.contents.deaths = section.content
      }
    }
  },

  clearObject: function() {
    this.contents.births = {}
    this.contents.deaths = {}
    this.contents.events = {}
  }
}

module.exports = wikiBot
