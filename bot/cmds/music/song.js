const Commando = require('discord.js-commando');

module.exports = class Song extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'song',
      group: 'music',
      memberName: 'song',
      description: 'Shows the currently playing song'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.current(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}