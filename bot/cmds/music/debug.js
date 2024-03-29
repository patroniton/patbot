const Commando = require('discord.js-commando');

module.exports = class Debug extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'debug',
      group: 'music',
      memberName: 'debug',
      description: 'Helps me make patbot better :).'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.debug();
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}