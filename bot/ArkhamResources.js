const fetch = require('node-fetch');
const cards = require('./../cards.json');
const Discord = require('discord.js');

async function getDeck(id) {
  try {
    return await fetch(`https://arkhamdb.com/api/public/deck/${id}.json`)
    .then(response => response.text())
    .then(text => JSON.parse(text));
  } catch (e) {
    return await fetch(`https://arkhamdb.com/api/public/decklist/${id}`)
    .then(response => response.text())
    .then(text => JSON.parse(text));
  }
}

function getCard(id) {
  return cards[id];
}

function getEmbedGalleryCode(deckId, cardId) {
  return `Gallery:Arkham:${deckId}:${cardId}`;
}

function createEmbedForDeck(deck, cardId) {
  const card = getCard(cardId);

  // get the number of cards by the slots code on the left side

  const embed = new Discord.MessageEmbed()
  .setColor('#FF0000')
  .setTitle(`${deck.name} - ${card.name}`)
  .setURL(`https://arkhamdb.com/deck/view/${deck.id}`)
  .setDescription(card.text)
  .addField('# in deck', deck.slots[cardId], true)
  .setImage(`https://arkhamdb.com/${card.imagesrc}`);

  return embed;
}

module.exports = {
  getDeck: getDeck,
  getCard, getCard,
  createEmbedForDeck: createEmbedForDeck,
  getEmbedGalleryCode: getEmbedGalleryCode
};