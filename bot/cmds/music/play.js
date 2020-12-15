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
      if (!message.guild.me.voice.channel) {
        await this.joinVoiceChannel(message);

        if(!message.guild.me.voice.channel) {
          return message.channel.send('No one\'s in a voice channel. I can\'t play music alone!');
        }
      }

      const results = await Youtube.search(args, { limit: 3 });
      const url = `https://www.youtube.com/watch?v=${results[0].id}`;

      const songInfo = await ytdl.getInfo(url);
      const song = {
        id: songInfo.videoDetails.video_id,
        title: Util.escapeMarkdown(songInfo.videoDetails.title),
        url: songInfo.videoDetails.video_url
      };

      const queuedEmbed = message.channel.send(this.getQueuedEmbed(song, message));

      if (this.client.patbot.music.queue.active) {
        this.client.patbot.music.queue.songs.push(song);
        return queuedEmbed;
      }

      // set up queue
      this.client.patbot.music.queue.textChannel = message.channel;
      this.client.patbot.music.queue.voiceChannel = message.guild.me.voice.channel;
      this.client.patbot.music.queue.connection = this.client.patbot.voiceConnection;
      this.client.patbot.music.queue.playing = true;
      this.client.patbot.music.queue.active = true;
      this.client.patbot.music.queue.songs.push(song);
      this.client.patbot.music.queue.trackNumber = 0;

      const play = async (song) => {
        const queue = this.client.patbot.music.queue;

        if (!song) {
          queue.textChannel.send('Done playing!');
          queue.voiceChannel.leave();
          this.client.patbot.music.queue = {
            textChannel: null,
            voiceChannel: null,
            connection: null,
            songs: [],
            volume: 2,
            playing: false
          };
          return;
        }
  
        const dispatcher = queue.connection.play(ytdl(song.url))
          .on('finish', () => {
            queue.trackNumber = queue.trackNumber + 1;

            // if loop, trackNumber % songs.length

            if (queue.trackNumber < queue.songs.length) {
              play(queue.songs[queue.trackNumber]);
            } else {
              message.channel.send('No more songs in the queue!');
            }
          })
          .on('error', error => console.error(error));

        dispatcher.setVolumeLogarithmic(queue.volume / 5);
        const nowPlayingEmbed = this.getNowPlayingEmbed(song, message);
        queue.textChannel.send(nowPlayingEmbed);
      };

      play(this.client.patbot.music.queue.songs[this.client.patbot.music.queue.trackNumber]);
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
      this.client.patbot.voiceConnection = await voiceChannelToJoin.join();
    }
  }

  getQueuedEmbed(song, message) {
    return new Discord.MessageEmbed()
      .setColor('#282c34')
      .setTitle(`Queued ${song.title}`)
      .setURL(song.url)
  }

  getNowPlayingEmbed(song, message) {
    return new Discord.MessageEmbed()
      .setColor('#282c34')
      .setTitle(`Now playing ${song.title}`)
      .setURL(song.url)
  }
}