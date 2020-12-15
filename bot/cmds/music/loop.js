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
      const queue = this.client.patbot.music.queue;
  
      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else {
        if (args.length > 0) { // eg. !loop off
          this.client.patbot.music.queue.options.loopQueue = false;
          message.react('🛑');
        } else {
          this.client.patbot.music.queue.options.loopQueue = true;
          message.react('🔁');
        }
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}