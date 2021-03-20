const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources');
const constants = require('../../../env');
const LULDOLLAR_USER_ID = constants[constants.env].discord_ids.luldollar_user_id;

module.exports = class Toot extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'toot',
      group: 'misc',
      memberName: 'toot',
      description: 'Special command to gather the gamers of the server.'
    });
  }

  async run(message, args) {
    try {
      // if (message.author.id !== LULDOLLAR_USER_ID) {
      //   message.channel.send('Only those worthy of the toot may use this command.');
      //   return;
      // }

      // const gamers = await DatabaseResources.getAvailabileGamersForToday();

      // let reply = 'The horn of games has been tooted! **ALL GAMERS ASSEMBLE!**\n';

      // // let reply = [
      // //   'The horn of games has been tooted! ALL GAMERS ASSEMBLE!',
      // // ].random();

      // for (let gamer of gamers) {
      //   reply += `<@${gamer.d_user_id}> `;
      // }

      // message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
}