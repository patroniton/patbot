const token = require('./token.js');
const patBot = require('./bot/PatBot.js');
const env = require('./env');

patBot.login(token[env.env]);