const fetch = require('node-fetch');
const games = require('./../steam_games.json').applist.apps;
const parseString = require('xml2js').parseString;
const Fuse = require('fuse.js')

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

function findGameByName(name) {
  const options = {
    keys: ['name'],
    includeScore: true,
    ignoreLocation: true,
    distance: 0,
    threshold: 0.2
  };

  const index = Fuse.createIndex(options.keys, games);
  const fuse = new Fuse(games, options, index);
  const result = fuse.search(name);

  if (result.length > 0 && result[0].score < 0.001) {
    return result[0].item;
  }

  return result;
}

function findGameById(id) {
  const options = {
    keys: ['appid'],
    threshold: 0
  };

  const index = Fuse.createIndex(options.keys, games);
  const fuse = new Fuse(games, options, index);
  const result = fuse.search(id);

  if (result.length > 0) {
    return result[0].item;
  }

  return result;
}

module.exports = {
  getRssFeedForGame,
  parseUpdateIdFromRss,
  findGameByName,
  findGameById
};