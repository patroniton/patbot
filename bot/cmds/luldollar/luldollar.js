const Commando = require('discord.js-commando');
const DatabaseResources = require('./../../DatabaseResources.js');

module.exports = class Luldollar extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'luldollar',
      group: 'luldollar',
      memberName: 'luldollar',
      description: 'Check luldollar balance'
    });
  }

  async run(message) {
    try {
      const luldollars = await DatabaseResources.getLuldollars();

      let luldollarMessage = '\n```';
  
      for (let luldollar of luldollars) {
        luldollarMessage += `${luldollar.name}: ${luldollar.luldollars}\n`;
      }
  
      luldollarMessage += '```';
  
      message.reply(luldollarMessage);
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }
}