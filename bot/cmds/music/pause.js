const Commando = require('discord.js-commando');

module.exports = class Pause extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      group: 'music',
      memberName: 'pause',
      description: 'Pauses the currently playing song.'
    });
  }

  async run(message, args) {
    try {
      const queue = this.client.patbot.music.queue;

      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else if (!queue.playing) {
        return message.channel.send('It\'s already paused!');
      } else {
        queue.connection.dispatcher.pause();
        message.react('⏸️');
        queue.playing = false;
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}