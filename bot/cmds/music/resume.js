const Commando = require('discord.js-commando');

module.exports = class Resume extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      group: 'music',
      memberName: 'resume',
      description: 'Resumes playing a paused or stopped song.'
    });
  }

  async run(message, args) {
    try {
      this.client.patbot.musicPlayer.resume(message);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}