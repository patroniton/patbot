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
      const keywords = ['tonight', 'tomorrow', 'today', 'next', 'this', 'to']
      let now = moment();
      let reply = 'Added availability for ';
      let availabilities = args.split(',');
      let start = null;
      let end = null;

      if (availabilities.length < 1) {
        start = now.format(dateFormat);
        end = now.format(dateFormat);

        reply += 'tonight';
        DatabaseResources.insertAvailability(user.id, message.id, start, end, 100, 1);
      } else {
        for (let availability of availabilities) {
          // eg. !here tomorrow 50%
          let percentage = this.getPercentageFromText(availability);

          if (availability.length < 1 || availability.includes('tonight')) {
            start = now.format(dateFormat);
            end = now.format(dateFormat);

            reply += `tonight (${percentage}%),`;
          } else if (availability.includes('tomorrow')) {
            start = now.add(1, 'day').format(dateFormat);
            end = now.add(1, 'day').format(dateFormat);

            reply += `tomorrow (${percentage}%),`;
          }

          DatabaseResources.insertAvailability(user.id, message.id, start, end, percentage, 1);
        }

        reply = reply.slice(0, -1);
      }

      message.reply(reply);
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }

  getPercentageFromText(text) {
    let percentage = 100;

    if (text.includes('%')) {
      percentage = parseInt(text.substring(text.lastIndexOf(' '), text.indexOf('%')));

      console.log(percentage);      

      if (isNaN(percentage)) {
        percentage = 100;
      }
    }

    return percentage;
  }
}