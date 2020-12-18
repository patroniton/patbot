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
      this.client.patbot.musicPlayer.pause(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}