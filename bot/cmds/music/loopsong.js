const Commando = require('discord.js-commando');

module.exports = class LoopSong extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'loopsong',
      group: 'music',
      memberName: 'loopsong',
      description: 'Loops the currently playing song. Use !loopsong off to turn off.'
    });
  }

  async run(message, args) {
    try {
      const player = this.client.patbot.musicPlayer;
      
      if (args.length === 0) {
        player.loopSong(message);
      } else {
        player.stopLoopSong(message);
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}