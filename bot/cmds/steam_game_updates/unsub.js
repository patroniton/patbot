const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');

module.exports = class UnSub extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'unsub',
      group: 'steam_game_updates',
      memberName: 'unsub',
      description: 'Unsubscribes you from game updates for the provided steam game ID',
      argsType: 'single'
    })
  }

  async run(message, args) {
    try {
      const steamGameId = message.content.split(' ')[1];
      const game = await DatabaseResources.getSteamGame(steamGameId);

      if (game) {
        const user = await DatabaseResources.getUser(message.author.id);
        const existingSubscription = await DatabaseResources.getSubscription(game.id, user.id);

        if (existingSubscription) {
          await DatabaseResources.deleteSubscription(existingSubscription.id);
          message.reply(`You're now unsubscribed from ${game.name}`);
        } else {
          message.reply(`You're not subscribed to ${game.name}!`);
        }
      } else {
        message.reply(`Couldn't find game with Steam ID of ${steamGameId}.`);
      }
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }
}