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
      const queue = this.client.patbot.music.queue;
 
      if (!queue.active) {
        return message.channel.send('I\'m not playing anything right now.');
      } else {
        if (args.length > 0) { // eg. !shuffle off
          this.client.patbot.music.queue.options.shuffle = false;
          message.react('🛑');
        } else {
          this.client.patbot.music.queue.options.shuffle = true;
          message.react('🔀');
        }
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}