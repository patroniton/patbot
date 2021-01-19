const Commando = require('discord.js-commando');

module.exports = class Remove extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      group: 'music',
      memberName: 'remove',
      description: 'Removes a song. Currently only supports track number as an argument.'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.remove(message, args);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}