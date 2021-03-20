const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');;

module.exports = class Uptime extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'drops',
      group: 'misc',
      memberName: 'drops',
      description: 'Lists the drops received for the user. Use !drops {nickname} to view another users drops'
    });
  }

  async run(message, args) {
    try {
      let user = null;

      if (args.length > 0) {
        user = await DatabaseResources.getUserByNickname(args);
      } else {
        user = await DatabaseResources.getUser(message.author.id);
      }

      if (!user) {
        message.channel.send("Sorry, looks like you aren't listed in the database yet.");
        return;
      }

      const drops = await DatabaseResources.getDropsForUser(user.id);

      let dropAmount = {
        million: 0,
        hundred_thousand: 0,
        thousand: 0
      }

      for (let drop of drops) {
        dropAmount[drop.drop] = drop.amount;
      }

      // million = '👑';
      // hundredThousand = '💎';
      // thousand = '🏆';

      let reply = `👑 - ${dropAmount.million}\n💎 - ${dropAmount.hundred_thousand}\n🏆 - ${dropAmount.thousand}`;

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}