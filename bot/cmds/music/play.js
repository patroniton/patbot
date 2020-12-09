const Commando = require('discord.js-commando');

module.exports = class Play extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'misc',
      memberName: 'play',
      description: 'Plays a song.'
    });
  }

  async run(message, args) {
    try {
      const connection = this.client.patbot.voiceConnection;

      const dispatcher = connection.play('./mp3/Feel.mp3');

      dispatcher.on('start', () => {
        console.log('playing!!!');
      });

      dispatcher.on('finish', () => {
        console.log('finished playing');
      });

      dispatcher.on('error', console.error);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}