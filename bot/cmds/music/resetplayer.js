const Commando = require('discord.js-commando');

module.exports = class ResetPlayer extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'resetplayer',
      group: 'music',
      memberName: 'resetplayer',
      description: 'Resets the music player to default settings. Provide any arguments to purge the queue as well.'
    });
  }

  async run(message, args) {
    try {
      let purgeQueue = false;
      if (args.length > 0) {
        purgeQueue = true;
      }
      this.client.patbot.musicPlayer.reset(purgeQueue);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}