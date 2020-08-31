const wiki = require("wikijs").default;

const wikiBot = {
  contents: {
    events: {},
    births: {},
    deaths: {},
  },

  init: async function (query) {
    return (
      wiki()
        // search for page of current day
        .search(query, 1)
        .then((data) =>
          wiki()
            // takes first result (the most corresponding)
            .page(data.results[0])
            .then((page) =>
              // categorize contents in deaths, births and events
              page.sections().then((sections) => {
                wikiBot.categorize(sections);
              })
            )
        )
        .catch((err) => {
          console.log("wikiBot - init", err);
        })
    );
  },

  categorize: function (sections) {
    for (section of sections) {
      if (section.title == "Events") {
        this.contents.events = section.content;
      } else if (section.title == "Births") {
        this.contents.births = section.content;
      } else if (section.title == "Deaths") {
        this.contents.deaths = section.content;
      }
    }
  },
};

module.exports = wikiBot;
