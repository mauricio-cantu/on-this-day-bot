const wiki = require('wikijs').default

module.exports = {
  contents: {
    events: {},
    births: {},
    deaths: {}
  },
  init(query) {
    wiki()
      .search(query, 1)
      .then(data =>
        wiki()
          .page(data.results[0])
          .then(page =>
            page.sections().then(sections => {
              this.categorize(sections)
            })
          )
      )
  },
  categorize(sections) {}
}
