const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');
const constants = require('../../../env');
const PAT_USER_ID = constants['prod'].discord_ids.pat_user_id;

module.exports = class Add extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'add',
      group: 'steam_game_updates',
      memberName: 'add',
      description: 'Adds a steam game to the database.',
      argsType: 'multiple'
    })
  }

  async run(message, args) {
    try {
      if (message.author.id === PAT_USER_ID) {
        const steamGameId = args.shift();
        const name = args.join(' ');
  
        DatabaseResources.insertGame(steamGameId, name);
        message.reply(`Added ${name} to the game list!`);
      } else {
        message.reply(`Disabled for non-admins because of some abuse of the command`)
      }

    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }
}