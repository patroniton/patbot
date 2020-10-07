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
      let availabilities;

      if (args === 'all') {
        availabilities = await DatabaseResources.getFutureAvailabilities();
      } else {
        availabilities = await DatabaseResources.getAllFutureAvailabilities();
      }

      if (availabilities.length === 0) {
        message.reply('No one has set any availabilities');
        return;
      }

      let currentDisplayedDate = null;
      let reply = '';

      for (let availability of availabilities) {
        if (currentDisplayedDate !== availability.start) {
          currentDisplayedDate = this.getDateDisplay(moment(availability.start, 'YYYY-MM-DD'));
          reply += `\n**${currentDisplayedDate}**:`;
        }

        reply += `\n${availability.name}`;
      }

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }
  
  getDateDisplay(date) {
    const now = moment();

    if (date.isSame(now)) {
      return 'tonight';
    } else if (date.diff(now, 'days') === 0) {
      return 'tomorrow';
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