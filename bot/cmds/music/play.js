const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const Youtube = require('youtube-sr');
const ytdl = require('ytdl-core');
const { Util } = require('discord.js');

module.exports = class Play extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Plays a song. Can provide any searchable text for youtube, or a direct youtube link.'
    });
  }

  async run(message, args) {
    try {
      let voiceConnection = null;

      if (!message.guild.me.voice.channel) {
        voiceConnection = await this.joinVoiceChannel(message);

        if(!voiceConnection) {
          return message.channel.send('No one\'s in a voice channel. I can\'t play music alone!');
        }
      }

      const player = this.client.patbot.musicPlayer;

      if (player.isOff()) {
        player.turnOn(voiceConnection, message);
      }

      await player.queueSong(args, message);
    
      if (player.isNotPlaying() || player.isPaused()) {
        player.play();
      }
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }

  async joinVoiceChannel(message) {
    let voiceChannelToJoin = null;

    if (message.member.voice.channel) {
      voiceChannelToJoin = message.member.voice.channel;
    } else {
      // join the most populated voice channel
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

    if (voiceChannelToJoin !== null) {
      return await voiceChannelToJoin.join();
    }

    return null;
  }
}