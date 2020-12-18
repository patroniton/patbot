const Commando = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class Queue extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'Displays the song queue.'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.showQueue(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}