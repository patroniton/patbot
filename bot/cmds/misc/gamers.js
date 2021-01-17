const Commando = require('discord.js-commando');
const moment = require('moment');
const DatabaseResources = require('../../DatabaseResources');

module.exports = class Gamers extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'gamers',
      group: 'misc',
      memberName: 'gamers',
      description: 'Lists all available gamers for the next 3 days (use "all" parameter to see all)'
    });
  }

  async run(message, args) {
    try {
      let availabilities = await DatabaseResources.getFutureAvailabilities(args);

      if (availabilities.length === 0) {
        message.channel.send('No one has set any availabilities');
        return;
      }

      let currentDisplayedDate = null;
      let reply = '';
      let gamersForDay = [];

      for (let availability of availabilities) {
        availability.start = moment(availability.start);

        if (!availability.start.isSame(currentDisplayedDate)) {
          currentDisplayedDate = availability.start.clone();
          reply += `\n\n**${this.getDateDisplay(currentDisplayedDate)}**:`;
          gamersForDay = [];
        }
        
        // already displayed for this day
        if (gamersForDay.includes(availability.name)) {
          continue;
        }

        gamersForDay.push(availability.name);
        reply += `\n${availability.name} ${availability.percentage}%`;

        if (availability.comment.length > 0) {
          reply += ` "${availability.comment}"`;
        }
      }

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
  
  getDateDisplay(date) {
    const now = moment();

    if (date.isSame(now, 'year') && date.isSame(now, 'month') && date.isSame(now, 'day')) {
      return 'Tonight';
    } else if (date.diff(now, 'days') === 0) {
      return 'Tomorrow';
    } else if (date.diff(now, 'days') <= 7) {
      return date.format('dddd');
    } else if (date.diff(now, 'days') >= 8 && date.diff(now, 'days') <= 15) {
      return 'next ' + date.format('dddd');
    } else if (date.diff(now), 'days' >= 16) {
      return `${date.format('MMM Do')}`;
    }

    return `Some day in the past ${date.format('YYYY-MM-DD')}`;
  }
}