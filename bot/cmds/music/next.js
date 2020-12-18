const Commando = require('discord.js-commando');

module.exports = class Next extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'next',
      group: 'music',
      memberName: 'next',
      description: 'Plays the next song.'
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