const Commando = require('discord.js-commando');

module.exports = class Leave extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      group: 'misc',
      memberName: 'leave',
      description: 'Leaves the voice channel.'
    });
  }

  async run(message, args) {
    try {
      if (message.guild.me.voice.channel) {
        message.guild.me.voice.channel.leave();
      } else {
        message.channel.send('I\'m not in a voice channel!');
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}