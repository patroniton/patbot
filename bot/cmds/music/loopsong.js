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
      const queue = this.client.patbot.music.queue;
   
      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else {
        if (args.length > 0) { // eg. !loopsong off
          this.client.patbot.music.queue.options.loopSong = false;
          message.react('🛑');
        } else {
          this.client.patbot.music.queue.options.loopSong = true;
          message.react('🔄');
        }
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}