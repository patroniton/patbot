const Commando = require('discord.js-commando');

module.exports = class Loop extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      description: 'Loops the current queue. Use !loop off to turn off.'
    });
  }

  async run(message, args) {
    try {
      const player = this.client.patbot.musicPlayer;
      
      if (args.length === 0) {
        player.loop(message);
      } else {
        player.stopLoop(message);
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}