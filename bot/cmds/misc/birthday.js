const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');
const moment = require('moment');

module.exports = class Birthday extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'birthday',
      group: 'misc',
      memberName: 'birthday',
      description: 'Displays everyone\'s birthday.'
    });
  }

  async run(message, args) {
    try {
      let birthdays = await DatabaseResources.getBirthdays();
      birthdays = birthdays.sort((a, b) => {
        const aBirthday = moment(a.birthday).format('MM') + moment(a.birthday).format('DD');
        const bBirthday = moment(b.birthday).format('MM') + moment(b.birthday).format('DD');

        return aBirthday > bBirthday ? 1 : -1;
      });

      let reply = '';
      let foundCurrentDate = false;
      const todayMonth = parseInt(moment().format('M'));
      const todayDay = parseInt(moment().format('D'));

      for (let birthday of birthdays) {
        const bday = moment(birthday.birthday);

        const birthdayMonth = parseInt(bday.format('M'));
        const birthdayDay = parseInt(bday.format('D'));

        if (!foundCurrentDate && birthdayMonth >= todayMonth && birthdayDay >= todayDay) {
          reply += '**';

          if (birthdayMonth === todayMonth && birthdayDay === todayDay) {
            reply += '🎂';
          }
        }

        reply += birthday.name + ': ' + bday.format('MMM') + ' ' + bday.format('D');

        if (!foundCurrentDate && birthdayMonth >= todayMonth && birthdayDay >= todayDay) {
          if (birthdayMonth === todayMonth && birthdayDay === todayDay) {
            reply += '🎂';
          }

          foundCurrentDate = true;
          reply += '**';
        }

        reply += '\n';
      }

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}