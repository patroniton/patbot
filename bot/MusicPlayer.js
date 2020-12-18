const Discord = require('discord.js');
const Youtube = require('youtube-sr');
const ytdl = require('ytdl-core');
const { Util } = require('discord.js');

const PREVIOUS = -1;

module.exports = class MusicPlayer {
  constructor() {
    this.resetOptions();
    // commandQueue to avoid clashing commands at the same time
  }

  resetOptions() {
    this.on = false;
    this.textChannel = null;
    this.voiceChannel = null;
    this.connection = null;
    this.songs = [];
    this.volume = 2;
    this.playing = false;
    this.paused = false;
    this.trackNumber = 0;
    // used to determine whether or not to auto-increment the track number or if it's been set from a command
    this.shouldUpdateTrackNumber = false;

    this.options = {
      shuffle: false,
      loopQueue: false,
      loopSong: false,
    };
  }
  
  turnOn(voiceConnection, message) {
    this.on = true;
    this.textChannel = message.channel;
    this.voiceChannel = message.guild.me.voice.channel;
    this.playing = false;
    this.trackNumber = 0;
    this.connection = voiceConnection;
  }

  turnOff() {
    // maybe keep options/queue for 30m, then reset
    this.voiceChannel.leave();
    this.resetOptions();
  }

  shuffle(message) {
    this.options.shuffle = true;
    message.react('🔀');
  }

  stopShuffle(message) {
    this.options.shuffle = false;
    message.react('❌');
  }

  loop(message) {
    this.options.loopQueue = true;
    message.react('🔁');
  }

  stopLoop(message) {
    this.options.loopQueue = false;
    message.react('❌');
  }

  loopSong(message) {
    this.options.loopSong = true;
    message.react('🔄');
  }

  stopLoopSong(message) {
    this.options.loopSong = false;
    message.react('❌');
  }

  stop(message) {
    this._end();
    message.react('🛑');
  }

  previous(message) {
    this.trackNumber -= 1;
    this.shouldUpdateTrackNumber = false;

    this._end();
    message.react('⏮');
  }

  next(message) {
    this.trackNumber += 1;
    this.shouldUpdateTrackNumber = false;
    this._end();
    message.react('⏭');
  }

  pause(message) {
    this.connection.dispatcher.pause();
    message.react('⏸️');
    this.paused = true;
    this.playing = false;
  }

  resume(message) {
    this.connection.dispatcher.resume();
    message.react('▶️');
  }

  showQueue(message) {
    let start = 0;
    let end = 10;

    start = this.trackNumber - 5;
    end = this.trackNumber + 5;

    if (start < 0) {
      end += Math.abs(start);
      start = 0;
    } else if (end > this.songs.length - 1) {
      start -= (end - this.songs.length - 1);
      end = this.songs.length - 1;
    }

    if (start < 0) {
      start = 0;
    }
    if (end > this.songs.length - 1) {
      end = this.songs.length - 1;
    }

    const queueReply = this._getQueueReply(start, end);

    message.channel.send(queueReply).then(message => {
      // TODO: add more fun emojis
      message.react(['🌋', '💥', '💀', '☠️', '⚔️', '🗡️', '🩸', '🔫'].random());
      message.delete({ timeout: 1000 * 60 });
    });
  }

  _end() {
    const isPaused = this.isPaused();
    this.connection.dispatcher.end();

    if (isPaused) {
      this.play();
    }
  }

  async queueSong(text, message) {
    if (text.length < 1) {
      return;
    }

    const song = await this._getSongFromText(text);
    song.addedBy = message.author.id;
    this.songs.push(song);
    this._send(this._getQueuedEmbed(song));
  }

  async play(song = null) {
    if (this.isPaused()) {
      this.resume();
      return;
    }
    song = song || this._getNextSong();

    if (!song) {
      this._send('No more songs in the queue! Use !play to start again.');
      this.playing = false;
      // this.turnOff();
      return;
    }

    this.playing = true;
    this.paused = false;

    const dispatcher = this.connection.play(ytdl(song.url))
      .on('finish', () => {
        this.play();
      })
      .on('error', error => console.error(error));

    dispatcher.setVolumeLogarithmic(this.volume / 5);
    const nowPlayingEmbed = this._getNowPlayingEmbed(song);
    this._send(nowPlayingEmbed);
  }

  async _getSongFromText(text) {
    let url = text;

    if (this._isNotYoutubeUrl(text)) {
      const results = await Youtube.search(text, { limit: 3 });
      url = `https://www.youtube.com/watch?v=${results[0].id}`;
    }
    
    const songInfo = await ytdl.getInfo(url);
    const song = {
      id: songInfo.videoDetails.video_id,
      title: Util.escapeMarkdown(songInfo.videoDetails.title),
      url: songInfo.videoDetails.video_url,
      length: songInfo.player_response.videoDetails.lengthSeconds
    };

    return song;
  }

  _isYoutubeUrl(text) {
    const regex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    const match = text.match(regex);

    if(match && match[2].length === 11) {
      return true;
    }

    return false;
  }

  _isNotYoutubeUrl(text) {
    return !this._isYoutubeUrl(text);
  }

  _getNextSong() {
    if (!this.shouldUpdateTrackNumber) {
      this.shouldUpdateTrackNumber = true;
    } else {
      // TODO: loopSong bugged
      if (!this.options.loopSong && !this.paused) {
        this.trackNumber++;
      }
    }

    if (this.trackNumber >= this.songs.length) {
      if (this.options.loopQueue) {
        this.trackNumber = (this.trackNumber + this.songs.length) % this.songs.length;
      } else {
        return null;
      }
    }

    const song = this.songs[this.trackNumber];

    return song;
  }

  isOn() {
    return this.on;
  }

  isOff() {
    return !this.isOn();
  }

  isPlaying() {
    return this.playing
  }

  isNotPlaying() {
    return !this.isPlaying()
  }

  isPaused() {
    return this.connection.dispatcher.paused || this.paused;
  }

  getOptions() {
    return this.options;
  }

  showOptions(message) {
    let reply = '```';

    Object.entries(this.options).forEach(option => {
      let emoji = option[1] ? '✔️' : '❌';
      reply += `${emoji} ${option[0]}\n`;
    });

    reply += '```';

    message.channel.send(reply).then(message => {
      // TODO: add more fun emojis
      message.react(['🌋', '💥', '💀', '☠️', '⚔️', '🗡️', '🩸', '🔫'].random());
      message.delete({ timeout: 1000 * 60 });
    });
  }

  _getQueueReply(start, end) {
    let reply = '```css\n'
    for (let i = start; i <= end; i++) {
      if (i === this.trackNumber) {
        reply += '    ⬐ current track\n';
      }

      reply += `${i+1}) ${this.trimSongName(this.songs[i].title)} ${this.getTimeString(this.songs[i].length)}\n`

      if (i === this.trackNumber) {
        reply += '    ⬑ current track\n';
      }
    }

    reply += '```';

    return reply;
  }

  getTimeString(seconds) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    // new Date(SECONDS * 1000).toISOString().substr(11, 8);
  }

  trimSongName(songTitle) {
    if (songTitle.length >= 37) {
      return songTitle.substring(0, 36) + '…';
    }

    return songTitle.padEnd('37');
  }

  _getQueuedEmbed(song) {
    return new Discord.MessageEmbed()
      .setColor('#282c34')
      .setDescription(`Queued [${song.title}](${song.url})`)
      .setURL(song.url);
  }

  _getNowPlayingEmbed(song) {
    return new Discord.MessageEmbed()
      .setColor('#282c34')
      .setDescription(`Now playing [${song.title}](${song.url})\nAdded by <@${song.addedBy}>`)
      .setURL(song.url);
  }

  _send(message) {
    this.textChannel.send(message).then(message => {
      // TODO: add more fun emojis
      message.react(['🌋', '💥', '💀', '☠️', '⚔️', '🗡️', '🩸', '🔫'].random());
      message.delete({ timeout: 1000 * 60 });
    });
  }
}