const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');;

module.exports = class Uptime extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'drops',
      group: 'misc',
      memberName: 'drops',
      description: 'Shows random drops for all the users in the channel that have received them.'
    });
  }

  async run(message, args) {
    try {
      const drops = await DatabaseResources.getRandomDrops();
      const dropTypes = await DatabaseResources.getRandomDropTypes();
      const users = await DatabaseResources.getUsersWithDrops();

      const longestName = users.sort((a, b) => b.name.length - a.name.length)[0].name.length + 1;

      let reply = '';
      reply += '`'.padEnd(longestName, ' ') + ' |';

      for (let dropType of dropTypes) {
        reply += ` ${dropType.emoji} |`
      }

      reply += '\n';

      for (let user of users) {
        reply += `${user.name.padEnd(longestName, ' ')}| `

        for (let dropType of dropTypes) {
          let userDrop = drops.find((drop) => {
            return drop.user_id === user.id && drop.emoji === dropType.emoji;
          });

          // no drops for this user for this drop, display 0
          if (!userDrop) {
            reply += '  0 ';
          } else {
            reply += (userDrop.amount).toString().padStart(3, ' ').padEnd(4, ' ');
          }

          // emojis are not monospaced, trophy provides a good breakpoint
          // to add another space to make the table look a bit better
          if (dropType.emoji === '💸') {
            reply += ' ';
          }

          reply += '|';
        }

        reply += '\n';
      }

      reply += '`';

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}