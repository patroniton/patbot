const Commando = require('discord.js-commando');
const ArkhamResources = require('../../ArkhamResources.js');


module.exports = class Deck extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'deck',
      group: 'arkham',
      memberName: 'deck',
      description: 'Fetches and displays an arkham deck from arkhamDB from the provided deck ID',
      argsType: 'single'
    })
  }

  async run(message, args) {
    try {
      const deckId = args;

      const deck = await ArkhamResources.getDeck(deckId);
      const cardId = Object.keys(deck.slots)[0];
      const code = ArkhamResources.getEmbedGalleryCode(deckId, cardId);

      const embed = ArkhamResources.createEmbedForDeck(deck, cardId);

      const arkhamMessage = await message.channel.send(code, embed);

      arkhamMessage.react('◀️').then(() => arkhamMessage.react('▶️'));
    } catch (e) {
      console.log(e);
      message.reply('Sorry, something went wrong.');
    }
  }

  // function copyApiResultToCardsJson() {
      // const fs = require('fs');
      // const allcards = require('./../../../allcards.json');
      // let json = {};
      // for (let card of allcards) {
      //   json[card.code] = card;
      // }

      // fs.writeFile('realcards.json', JSON.stringify(json), () => {});
  // }
}