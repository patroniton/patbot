const Commando = require('discord.js-commando');

module.exports = class Previous extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'prev',
      group: 'music',
      memberName: 'prev',
      description: 'Plays the previous song.'
    });
  }

  async run(message, args) {
    try {
      const queue = this.client.patbot.music.queue;

      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else {
        queue.options.previous = true;
        queue.connection.dispatcher.end();
        message.react('↩️');
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}