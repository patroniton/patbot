const Commando = require('discord.js-commando');

module.exports = class Previous extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'prev',
      group: 'music',
      memberName: 'prev',
      description: 'Plays the previous song.'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.previous(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}