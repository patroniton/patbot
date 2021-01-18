const Commando = require('discord.js-commando');

module.exports = class Track extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'track',
      group: 'music',
      memberName: 'track',
      description: 'Sets the track number to the provided number.'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.setTrack(message, args);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}