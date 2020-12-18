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
      this.client.patbot.musicPlayer.next(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}