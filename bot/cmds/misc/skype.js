const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');
const moment = require('moment');

module.exports = class Skype extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'skype',
      group: 'misc',
      memberName: 'skype',
      description: 'Gets a random old Skype message to display.'
    });
  }

  async run(message, args) {
    try {
      const skypeMessage = await DatabaseResources.getRandomSkypeMessage();

      let reply = `msgid:${skypeMessage.id}\n`;
      reply += `[${moment.unix(skypeMessage.timestamp).format('MMM Do YYYY')}]\n`;
      reply += `${skypeMessage.name}: ${skypeMessage.message}`;

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}