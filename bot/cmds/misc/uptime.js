const Commando = require('discord.js-commando');
const moment = require('moment');

module.exports = class Uptime extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'uptime',
      group: 'misc',
      memberName: 'uptime',
      description: 'Responds with the date and time of when the bot last joined the server'
    });
  }

  async run(message, args) {
    try {
      const end = new moment();
      const start = this.client.patbot.startTime;
      const days = moment.duration(end.diff(start)).asDays();

      message.channel.send(`I've been online since ${start.format('MMM Do')} (about ${Math.round(days)} days)`);
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }
}