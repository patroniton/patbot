const Commando = require('discord.js-commando');

module.exports = class Skip extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skips the current song.'
    });
  }

  async run(message, args) {
    try {
      const queue = this.client.patbot.music.queue;

      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else {
        queue.connection.dispatcher.end();
        message.react('⏭');
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}