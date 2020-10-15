const Commando = require('discord.js-commando');
const moment = require('moment');
const DatabaseResources = require('../../DatabaseResources');
const dateFormat = 'YYYY-MM-DD'; // maybe add time format when we want to track time

module.exports = class Here extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'here',
      group: 'misc',
      memberName: 'here',
      description: 'Saves availability of gamers. eg: !here tonight, !here tomorrow, !here Saturday (any full weekday or single letter weekday is accepted)'
    });
  }

  async run(message, args) {
    try {
      const user = await DatabaseResources.getUser(message.author.id);
      const dayWords = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'u', 'm', 't', 'w', 'r', 'f', 's', 'tonight', 'tn', '2nite', '2night', 'tomorrow', 'tmr', 'tmrw'];
      const modifiers = [
        'next', // !here next friday, !here next Wednesday
        // 'until', // !here until tomorrow, !here until Saturday
        // 'this', // !here this friday, !here this week // actually not sure if this does anything
        // 'to', // !here thursday to saturday, !here tonight to tomorrow
      ];

      const groupOfWords = args.toLowerCase().split(',');
      let dates = [];
      let start = moment().startOf('day');
      let end = moment().startOf('day');
      let percentage = 100;

      for(let wordGroup of groupOfWords) {
        let startDateFound = false;
        let endDateFound = false;
        start = moment().startOf('day');
        end = moment().startOf('day');
        percentage = 100;

        const words = wordGroup.split(' ');

        for (let word of words) {
          if (word.includes('%')) {
            percentage = this.getPercentageFromText(word);
            continue;
          }

          // end date has been found so ignore the rest of the words in the group
          if (endDateFound) {
            break;
          }
  
          if ((dayWords.includes(word))) {
            if (!startDateFound) {
              startDateFound = true;
              start = this.getDayFromKeyword(word, start);
              continue;
            } else {
              end = this.getDayFromKeyword(word, end);
              endDateFound = true;
            }
          }

          if (modifiers.includes(word)) {
            if (!startDateFound) {
              start = this.applyModifier(word, start);
            } else {
              end = this.applyModifier(word, end);
            }
          }
        }

        if (!endDateFound) {
          end = start.clone();
        }

        dates.push({start, end, percentage});
      }

      let reply = `Added availabilit${dates.length > 1 ? 'ies' : 'y'} for`;

      for (let date of dates) {
        reply += ` ${this.getDateDisplay(date.start)}`;
        
        if (date.start.diff(date.end, 'days') > 0) {
          reply += ` to ${this.getDateDisplay(date.end)}`;
        }

        reply += ` (${date.percentage}%),`;

        DatabaseResources.insertAvailability(user.id, message.id, date.start.format(dateFormat), date.end.format(dateFormat), date.percentage);
      }

      reply = reply.slice(0, -1);
      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }

  getPercentageFromText(text) {
    const percentage = parseInt(text.slice(0, -1));

    return isNaN(percentage) ? 100 : percentage;
  }

  getDayFromKeyword(word, date) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekDaysShort = ['u', 'm', 't', 'w', 'r', 'f', 's'];
    let modifiedDate = date.clone();

    if (weekDaysShort.includes(word)) {
      // TODO: shouldn't change a parameter's value
      word = weekdays[weekDaysShort.indexOf(word)];
    }

    if (weekdays.includes(word)) {
      modifiedDate.day(word);
      
      // day() will set it to the current week's day (so Tuesday the 3rd will give us Sunday the 1st if we pass in Sunday/U)
      // so if it's in the past, add a week
      if (modifiedDate.day() < date.day()) {
        modifiedDate.add(1, 'week');
      }
    } else if (word === 'tomorrow' || word === 'tmr' || word === 'tmrw') {
      modifiedDate.add(1, 'day');
    }

    return modifiedDate;
  }

  applyModifier(modifier, date) {
    let modifiedDate = date.clone();

    if (modifier === 'next') {
      modifiedDate.add(1, 'week');
    }

    return modifiedDate;
  }

  getDateDisplay(date) {
    const now = moment();

    if (date.isSame(now, 'year') && date.isSame(now, 'month') && date.isSame(now, 'day')) {
      return 'tonight';
    } else if (date.diff(now, 'days') === 0) {
      return 'tomorrow';
    } else if (date.diff(now, 'days') <= 7) {
      return date.format('dddd');
    } else if (date.diff(now, 'days') >= 8 && date.diff(now, 'days') <= 15) {
      return 'next ' + date.format('dddd');
    } else if (date.diff(now), 'days' >= 16) {
      return `on ${date.format('MMM Do')}`;
    }

    return `Some day in the past ${date.format('YYYY-MM-DD')}`;
  }
}