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
      ];
      const groupOfWords = args.split(',');
      let dates = [];

      for(let wordGroup of groupOfWords) {
        let dateFound = false;
        let percentageFound = false;
        let comment = '';
        let start = moment().startOf('day');
        let percentage = 100;
        let wordsBeforeComment = 0;

        const words = wordGroup.split(' ');

        for (let word of words) {
          if (word.length < 1) {
            continue;
          }

          // everything after the percentage is considered part of the comment
          if (percentageFound) {
            comment += `${word} `;
            continue;
          }

          if (word.includes('%') || !isNaN(word)) {
            percentage = this.getPercentageFromText(word);
            percentageFound = true;
            continue;
          }
  
          if ((dayWords.includes(word.toLowerCase()))) {
            if (!dateFound) {
              dateFound = true;
              start = this.getDayFromKeyword(word, start);
              continue;
            }
          }

          if (modifiers.includes(word.toLowerCase())) {
            if (!dateFound) {
              start = this.applyModifier(word, start);
              wordsBeforeComment++;
            }
          }
        }

        // implied 100% (no percent was explicitly given), so all non-modifier words are the comment
        if (!percentageFound) {
          if (dateFound) {
            wordsBeforeComment++;
          }

          for (let i = 0; i < wordsBeforeComment; i++) {
            words.shift();
          }

          comment = words.join(' ').trim();
        }

        // comment = comment.trim();
        dates.push({start, percentage, comment});
      }

      let reply = `Added availabilit${dates.length > 1 ? 'ies' : 'y'} for`;

      for (let date of dates) {
        reply += ` ${this.getDateDisplay(date.start)}`;
        reply += ` (${date.percentage}%)`;

        if (date.comment.length > 0) {
          reply += ` "${date.comment}"`;
        }

        reply += ',';

        DatabaseResources.insertAvailability(user.id, message.id, date.start.format(dateFormat), date.comment, date.percentage);
      }

      reply = reply.slice(0, -1);
      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }

  getPercentageFromText(text) {
    if (text.includes('%')) {
      const percentage = parseInt(text.slice(0, -1));      
      return isNaN(percentage) ? 100 : percentage;
    }

    return parseInt(text);
  }

  getDayFromKeyword(word, date) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekDaysShort = ['u', 'm', 't', 'w', 'r', 'f', 's'];
    let modifiedDate = date.clone();

    if (weekDaysShort.includes(word.toLowerCase())) {
      // TODO: shouldn't change a parameter's value
      word = weekdays[weekDaysShort.indexOf(word)];
    }

    if (weekdays.includes(word.toLowerCase())) {
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
    } else if (date.diff(now, 'days') <= 6) {
      return date.format('dddd');
    } else if (date.diff(now, 'days') >= 7 && date.diff(now, 'days') <= 15) {
      return 'next ' + date.format('dddd');
    } else if (date.diff(now), 'days' >= 16) {
      return `on ${date.format('MMM Do')}`;
    }

    return `Some day in the past ${date.format('YYYY-MM-DD')}`;
  }
}