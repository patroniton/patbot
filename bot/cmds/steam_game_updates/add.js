const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');
const constants = require('../../../env');
const SteamResources = require('../../SteamResources.js');
const PAT_USER_ID = constants['prod'].discord_ids.pat_user_id;
const MAX_MATCHES = 10;

module.exports = class Add extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'add',
      group: 'steam_game_updates',
      memberName: 'add',
      description: 'Adds a steam game to the database.',
    })
  }

  async run(message, args) {
    try {
      const name = args;
      let game = null;

      // adding by app ID
      if (!isNaN(parseInt(name)) && typeof parseInt(name) === 'number') {
        game = SteamResources.findGameById(name);
      } else {
        game = SteamResources.findGameByName(name);
      }

      // multiple games were found - suggest 
      if (Array.isArray(game)) {
        let reply = '';

        if (game.length === 0) {
          reply = 'No matches found. Please double check the name of the game or add the game by the Steam ID.';
        } else if (game.length <= MAX_MATCHES) {
          reply = 'Found multiple results. Here are all the games I found:';
          for (let singleGame of game) {
            reply += `\n- ${singleGame.item.name} (ID: ${singleGame.item.appid})`;
          }
        } else {
          reply = `Found more than ${MAX_MATCHES} potential matches (${game.length}). Please double check the name of the game or add the game by the Steam ID.`
        } 

        console.log(game);
        message.channel.send(reply);
        return;
      }

      const existingGame = await DatabaseResources.getSteamGame(game.appid);

      if (existingGame) {
        message.channel.send(`Whoops! We already have ${game.name} added to our game list`);
        return;
      }

      DatabaseResources.insertGame(game.appid, game.name);
      message.channel.send(`Added ${game.name} to the game list!`);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}