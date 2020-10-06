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
        'until', // !here until tomorrow, !here until Saturday
        'this', // !here this friday, !here this week // actually not sure if this does anything
        'to', // !here thursday to saturday, !here tonight to tomorrow
        'and', // !here thursday and friday, !here friday and sunday // if and found terminate early and just set end to the start date and then treat this as a new argument
      ];

      const now = moment();

      let availabilityWords = args.split(' ');

      for (let availabilityWord of availabilityWords) {
        let startDateFound = false;

        let start = now.clone();
        let end = now.clone();

        // eg. !here thursday to friday, sunday to next wednesday
        


        // availabilityWords = availability.split(' ')
        // check to see if the word is in either dayKeywords or modifiers array

        // if not found, continue to next element (this word is ignored)
        // availabilityWord is now contained in either dayKeywords or modifiers

        // foreach dayKeywords
          // if found
            // if start not found (so this is likely our first date we've encountered, which will be assumed the start date)
              // set startFound = true
              // modify start date based on what the match was (ie. if tomorrow get the next day, !here friday gets the next friday)
            // else (so start has been found, this is our end date)
              // modify end date on what the match was (ie. if !here monday to saturday, start is on monday so you just get the next saturday after start)
              // commit to DB
              // reply
              // return
        
        // foreach modifiers
          // if found
            // if start has NOT been found (ie. are we before or after start date. before = modifying start, after = modifying end)
              // modify start date based on what the match was (ie. if !here next friday next would add a week)
            // if start has been found
              // modify end date based on what the match was (ie. if !here next friday next would add a week)
        
        
        // outside of availabilityWords loop
        // end date was never found, so user just said one day ie. !here friday
        // set end date to start date
        // commit to DB
        // reply
        // return
      }






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