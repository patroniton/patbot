const Commando = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class Queue extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'Displays the song queue.'
    });
  }

  async run(message, args) {
    try {
      const songs = this.client.patbot.music.queue.songs;

      // get current place
      const trackNumber = this.client.patbot.music.queue.trackNumber;

      let start = 0;
      let end = 10;

      start = trackNumber - 5;
      end = trackNumber + 5;

      if (start < 0) {
        end += Math.abs(start);
        start = 0;
      } else if (end > songs.length - 1) {
        start -= (end - songs.length - 1);
        end = songs.length - 1;
      }

      if (start < 0) {
        start = 0;
      }
      if (end > songs.length - 1) {
        end = songs.length - 1;
      }

      // formatting queue reply
      let reply = '```css\n'
      for (let i = start; i <= end; i++) {
        if (i === trackNumber) {
          reply += '    ⬐ current track\n';
        }

        reply += `${i+1}) ${this.trimSongName(songs[i].title)} ${this.getTimeString(songs[i].length)}\n`

        if (i === trackNumber) {
          reply += '    ⬑ current track\n'
        }
      }

      reply += '```';

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
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
}