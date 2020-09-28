const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;

async function getRssFeedForGame(id) {
  let json = null;

  await fetch(`https://store.steampowered.com/feeds/newshub/app/${id}/`)
    .then(response => response.text())
    .then(xml => parseString(xml, (error, result) => json = result));

  return json.rss;
}

function parseUpdateIdFromRss(update) {
  return update.link[0].split('/').slice(-1)[0]
}

module.exports = {
  getRssFeedForGame: getRssFeedForGame,
  parseUpdateIdFromRss: parseUpdateIdFromRss
};