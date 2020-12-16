const Commando = require('discord.js-commando');

module.exports = class Resume extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      group: 'music',
      memberName: 'resume',
      description: 'Resumes playing a paused or stopped song.'
    });
  }

  async run(message, args) {
    try {
      const queue = this.client.patbot.music.queue;

      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else if (queue.playing) {
        return message.channel.send('It\'s already playing!');
      } else {
        queue.connection.dispatcher.resume();
        message.react('▶️');
        queue.playing = true;
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}