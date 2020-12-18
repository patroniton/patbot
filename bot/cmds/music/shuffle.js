const Commando = require('discord.js-commando');

module.exports = class Shuffle extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      group: 'music',
      memberName: 'shuffle',
      description: 'Shuffles the current queue. Use !shuffle off to turn off.'
    });
  }

  async run(message, args) {
    try {
      const player = this.client.patbot.musicPlayer;
      
      if (args.length === 0) {
        player.shuffle(message);
      } else {
        player.stopShuffle(message);
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}