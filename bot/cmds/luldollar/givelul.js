const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources');
const constants = require('./../../../env');
const LULDOLLAR_USER_ID = constants[constants.env].discord_ids.luldollar_user_id;
const PAT_USER_ID = constants[constants.env].discord_ids.pat_user_id;

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
      if (![LULDOLLAR_USER_ID, PAT_USER_ID].includes(message.author.id)) {
        message.channel.send('Dopple should remove a luldollar for that.');
        return;
      }

      const nicknames = await DatabaseResources.getNicknames();

      for (let nickname of nicknames) {
        if (args.toLowerCase().replace(' ', '') === nickname.nickname.toLowerCase().replace(' ', '')) {
          const userToLul = await DatabaseResources.getUserById(nickname.user_id);
          await DatabaseResources.insertLuldollar(userToLul.d_user_id, message.id, 1);

          message.channel.send(`Gave a luldollar to ${args}!`);

          return;
        }
      }

      message.channel.send(`Couldn't find anyone with a nickname of ${args}`)
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}