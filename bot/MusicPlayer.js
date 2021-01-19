const Discord = require('discord.js');
const Youtube = require('youtube-sr');
const ytdl = require('ytdl-core');
const { Util } = require('discord.js');

module.exports = class MusicPlayer {
  constructor() {
    this._resetPlayer();
    this.commandQueue = [];
  }

  _resetPlayer(purgeQueue = true) {
    this.on = false;

    if (this.isPlaying()) {
      this._end();
    }

    if (this.voiceChannel) {
      this.voiceChannel.leave();
    }

    this.textChannel = null;
    this.voiceChannel = null;
    this.connection = null;
    this.volume = 2;
    this.playing = false;
    this.paused = false;
    this.trackNumber = 0;
    // used to determine whether or not to auto-increment the track number or if it's been set from a command
    this.shouldUpdateTrackNumber = false;

    if (purgeQueue) {
      this.songs = [];
    }

    this.options = {
      shuffle: false,
      loopQueue: false,
      loopSong: false,
    };
  }

  reset(purgeQueue = true) {
    this._resetPlayer(purgeQueue);
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
    this.on = false;
    // TODO: maybe keep options/queue for 30m, then reset
    this.voiceChannel.leave();
    this._resetPlayer();
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

  // TODO: doesn't do anything
  stop(message = null) {
    if (message) {
      message.react('🛑');
    }

    if (this.isNotPaused()) {
      this._end();
    }
  }

  async previous(message = null) {
    if (this.isPaused()) {
      await this.play();
    }

    if (message) {
      message.react('⏮');
    }

    this.trackNumber -= 1;
    this.shouldUpdateTrackNumber = false;
    if (this.isPaused()) {
      this.resume()
    }
    this._end();
  }

  async next(message = null) {
    if (this.isPaused()) {
      await this.play();
    }
    
    if (message) {
      message.react('⏭');
    }

    this.trackNumber += 1;
    this.shouldUpdateTrackNumber = false;

    this._end();
  }

  pause(message = null) {
    if (message) {
      message.react('⏸️');
    }

    this.connection.dispatcher.pause();
    this.paused = true;
    this.playing = false;
  }

  resume(message = null) {
    if (message) {
      message.react('▶️');
    }

    this.connection.dispatcher.resume();
    this.paused = false;
    this.playing = true;
  }

  // TODO: probably shouldn't be passing message here to be parsed and instead just pass the number
  setTrack(message, args) {
    if (message) {
      message.react('👌');
    }

    let track = parseInt(args);

    if (isNaN(track)) {
      this._send(`Couldn't parse a number from the given argument ${args}`);
      return;
    }

    // array starts at 0, but display for songs starts at 1, so the user wants the previous track number
    track--;

    if (track < 0 || track > this.songs.length - 1) {
      this._send(`Please enter a valid number within the tracks range. Number given: ${track}. Valid numbers between 1-${this.songs.length}`);
      return;
    }

    this.trackNumber = track;
    this.shouldUpdateTrackNumber = false;
    this._end();
  }

  showQueue(message) {
    if (this.songs.length < 1) {
      return;
    }

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
    if (this.connection && this.connection.dispatcher) {
      this.connection.dispatcher.end();

      // see https://github.com/discordjs/discord.js/issues/4062 for reasoning for calling dispatcher._writeCallback()

      // sometimes this errors out saying "this.connection.dispatcher._writeCallback() is not a function"
      if (this.isFunction(this.connection.dispatcher._writeCallback)) {
        this.connection.dispatcher._writeCallback();
      }
    }
  }

  isFunction(fn) {
    return fn && {}.toString.call(fn) === '[object Function]';
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

  debug() {
    console.log('----------------------------------------------');
    console.log(`this.connection: ${this.connection}`);
    console.log(`this.volume: ${this.volume}`);
    console.log(`this.playing: ${this.playing}`);
    console.log(`this.paused: ${this.paused}`);
    console.log(`this.trackNumber: ${this.trackNumber}`);
    console.log(`this.shouldUpdateTrackNumber: ${this.shouldUpdateTrackNumber}`);
    console.log('----------------------------------------------');
  }

  async play() {
    if (this.isPaused()) {
      this.connection.dispatcher.resume();
      this.paused = false;
      return;
    }

    const song = this._getNextSong();

    if (!song) {
      this._send('No more songs in the queue! Use !play to start again. I will disconnect and purge the queue in 5 minutes if no commands are used.');
      this.playing = false;

      if (!this.turnOffTimeoutId) {
        this.turnOffTimeoutId = setTimeout(() => {
          this.turnOffTimeoutId = null;
          this.turnOff();
        }, 1000 * 60 * 5);
      }

      return;
    } else {
      if (this.turnOffTimeoutId) {
        clearTimeout(this.turnOffTimeoutId);
        this.turnOffTimeoutId = null;
      }
    }

    this.playing = true;
    this.paused = false;

    const dispatcher = this.connection.play(ytdl(song.url, {audioonly: true}))
      .once('finish', () => {
        if (this.isOn()) {
          this.play();
        }
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
      if (!this.options.loopSong && !this.paused && this.isPlaying()) {
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
    if (this.connection && this.connection.dispatcher) {
      return this.paused || this.connection.dispatcher.paused;
    }
    return this.paused;
  }

  isNotPaused() {
    return !this.isPaused();
  }

  getOptions() {
    return this.options;
  }

  showOptions(message) {
    let reply = '```';

    Object.entries(this.options).forEach(option => {
      let emoji = option[1] ? '✔️' : '❌';
      reply += `${emoji}${option[0]}\n`;
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