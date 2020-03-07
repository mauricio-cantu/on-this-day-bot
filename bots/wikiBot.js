const wiki = require('wikijs').default

const wikiBot = {
  contents: {
    events: {},
    births: {},
    deaths: {}
  },

  init: async function(query) {
    return new Promise(function(resolve, reject) {
      wiki()
        // procura pela pagina do dia correspondente
        .search(query, 1)
        .catch(err => {
          reject(err)
          return
        })
        .then(data =>
          wiki()
            // pega primeiro resultado (o mais correspondente)
            .page(data.results[0])
            .then(page =>
              page.sections().then(sections => {
                // separa os conteudos em categorias
                wikiBot.categorize(sections)
                resolve('done')
              })
            )
        )
        .catch(err => {
          reject(err)
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
  }
}

module.exports = wikiBot
