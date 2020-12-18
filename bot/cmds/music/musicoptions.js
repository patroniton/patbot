const Commando = require('discord.js-commando');

module.exports = class MusicOptions extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'musicoptions',
      group: 'music',
      memberName: 'musicoptions',
      description: 'Lists the current option names and values for the music player.'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.showOptions(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}