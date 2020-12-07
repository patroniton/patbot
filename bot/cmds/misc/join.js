const Commando = require('discord.js-commando');

module.exports = class Join extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'join',
      group: 'misc',
      memberName: 'join',
      description: 'Joins the user\'s voice channel. If not in a voice channel it will join the most populated voice channel.'
    });
  }

  async run(message, args) {
    try {
      let voiceChannelToJoin = null;

      if (message.member.voice.channel) {
        voiceChannelToJoin = message.member.voice.channel;
      } else {
        const voiceChannels = message.member.guild.channels.cache.filter(channel => channel.type === 'voice');

        let mostUsersInVoiceChannel = 0;

        for (const [id, voiceChannel] of voiceChannels) {
          let usersInVoiceChannel = voiceChannel.members.size;

          if (usersInVoiceChannel > mostUsersInVoiceChannel) {
            mostUsersInVoiceChannel = usersInVoiceChannel;
            voiceChannelToJoin = voiceChannel;
          }
        }
      }

      if (voiceChannelToJoin === null) {
        message.channel.send('No one\'s in a voice channel! I don\'t want to be alone :(');
      } else {
        const connection = await voiceChannelToJoin.join();
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}