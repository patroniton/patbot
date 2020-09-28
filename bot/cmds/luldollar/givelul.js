const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources');
const constants = require('./../../../env');
const LULDOLLAR_USER_ID = constants[constants.env].discord_ids.luldollar_user_id;

module.exports = class GiveLul extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'givelul',
      group: 'luldollar',
      memberName: 'givelul',
      description: 'Gives a luldollar to the specified user'
    })
  }

  async run(message, args) {
    try {
      if (message.author.id !== LULDOLLAR_USER_ID) {
        message.reply('Dopple should remove a luldollar for that.');
        return;
      }

      const nicknames = await DatabaseResources.getNicknames();

      for (let nickname of nicknames) {
        if (args.toLowerCase().replace(' ', '') === nickname.nickname.toLowerCase().replace(' ', '')) {
          const userToLul = await DatabaseResources.getUserById(nickname.user_id);
          await DatabaseResources.insertLuldollar(userToLul.d_user_id, message.id, 1);

          message.reply(`Gave a luldollar to ${args}!`);

          return;
        }
      }

      message.reply(`Couldn't find anyone with a nickname of ${args}`)
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }
}