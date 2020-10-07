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
      description: 'Saves availability of gamers. eg: !here tonight, !here tomorrow, !here Saturday, !here Monday - Friday'
    });
  }

  async run(message, args) {
    try {
      const user = await DatabaseResources.getUser(message.author.id);
      const dayKeywords = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'u', 'm', 't', 'w', 'r', 'f', 's', 'tonight', 'tn', '2nite', '2night', 'tomorrow', 'tmr', 'tmrw'];
      const modifiers = [
        'next', // !here next friday, !here next Wednesday
        // 'until', // !here until tomorrow, !here until Saturday
        // 'this', // !here this friday, !here this week // actually not sure if this does anything
        // 'to', // !here thursday to saturday, !here tonight to tomorrow
        // 'and', // !here thursday and friday, !here friday and sunday // if and found terminate early and just set end to the start date and then treat this as a new argument
      ];

      
      let availabilityWords = args.toLowerCase().split(' ');
      let percentage = 100;
      let startDateFound = false;

      let start = moment();
      let end = moment();

      // eg. !here thursday to friday, sunday to next wednesday

      for (let availabilityWord of availabilityWords) {
        if (availabilityWord.includes('%')) {
          percentage = this.getPercentageFromText(availabilityWord);
        }
        
        // not found in keywords - ignore word
        if (!(dayKeywords.includes(availabilityWord) || modifiers.includes(availabilityWord))) {
          continue;
        }

        // check if word is a day
        for (let dayKeyword of dayKeywords) {
          if (dayKeyword === availabilityWord) {
            if (!startDateFound) {
              startDateFound = true;
              start = this.getDayFromKeyword(dayKeyword, start);
              continue;
            } else {
              end = this.getDayFromKeyword(dayKeyword, end);
              DatabaseResources.insertAvailability(user.id, message.id, start.format(dateFormat), end.format(dateFormat), percentage);
              message.reply(`added availability for ${this.getDateDisplay(start)} ${start.diff(end, 'days') === 0 ? '' : `to ${this.getDateDisplay(end)} `}(${percentage}%)`);
              return;
            }
          }
        }

        // check if word is a modifier
        for (let modifier of modifiers) {
          if (modifier === availabilityWord) {
            if (!startDateFound) {
              start = this.applyModifier(modifier, start);
            } else {
              end = this.applyModifier(modifier, end);
            }
          }
        }
      }

      end = start;
      DatabaseResources.insertAvailability(user.id, message.id, start.format(dateFormat), end.format(dateFormat), percentage);
      message.reply(`added availability for ${this.getDateDisplay(start)} (${percentage}%)`);
      return;

      // for when multiple arguments are supported
      // startDateFound = false;
    } catch (e) {
      message.reply('Sorry, something went wrong.');
    }
  }

  getPercentageFromText(text) {
    const percentage = parseInt(text.slice(0, -1));

    return isNaN(percentage) ? 100 : percentage;
  }

  getDayFromKeyword(word, date) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'u', 'm', 't', 'w', 'r', 'f', 's'];
    let modifiedDate = date.clone();

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

    if (date.isSame(now)) {
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