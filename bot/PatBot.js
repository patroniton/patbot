const path = require('path');
const moment = require('moment');
const token = require('./../token.js');
const SteamResources = require('./SteamResources.js');
const DatabaseResources = require('./DatabaseResources.js');
const ArkhamResources = require('./ArkhamResources.js');
const Discord = require('discord.js');

const Commando = require('discord.js-commando');
const client = new Commando.CommandoClient({
  owner: token.owner,
  commandPrefix: '!'
});

const constants = require('./../env');
const GAME_UPDATE_CHANNEL_ID = constants[constants.env].discord_ids.game_update_channel_id;
const LULDOLLAR_USER_ID = constants[constants.env].discord_ids.luldollar_user_id;
const LULDOLLAR_EMOJI_ID = constants[constants.env].discord_ids.luldollar_emoji_id;

const GAME_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

function login(token) {
  client.login(token);

  registerEvents();
}

function registerEvents() {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.registry
      .registerGroups([
        ['luldollar', 'luldollar commands'],
        ['steam_game_updates', 'steam game update commands'],
        ['arkham', 'Arkham related commands'],
      ])
      .registerCommandsIn(path.join(__dirname, 'cmds'));

    checkForGameUpdates();
    setInterval(checkForGameUpdates, GAME_CHECK_INTERVAL);
  });

  client.on('messageReactionAdd', async (messageReaction, user) => {
    // luldollar add
    if (user.id === LULDOLLAR_USER_ID && messageReaction.emoji.id === LULDOLLAR_EMOJI_ID) {
      DatabaseResources.insertLuldollar(messageReaction.message.author.id, messageReaction.message.id).then(() => {
        messageReaction.message.react('✅');
      });
    }

    // Arkham deck display
    if (messageReaction.message.content.startsWith('Gallery') && messageReaction.message.author.id === client.user.id && user.id !== client.user.id) {
      handleGalleryReaction(messageReaction, user);
    }
  });
  
  client.on('messageReactionRemove', async (messageReaction, user) => {
    // luldollar remove
    if (user.id === LULDOLLAR_USER_ID && messageReaction.emoji.id === LULDOLLAR_EMOJI_ID) {
      DatabaseResources.deleteLuldollar(messageReaction.message.id).then(() => {
        messageReaction.message.reactions.cache.get('✅').remove();
      });
    }
    
    // Arkham deck display
    if (messageReaction.message.content.startsWith('Gallery') && messageReaction.message.author.id === client.user.id && user.id !== client.user.id) {
      handleGalleryReaction(messageReaction, user);
    }
  });

  client.on('message', async (message) => {
    // relay mention directed at the bot towards pat
    const pat = await DatabaseResources.getUserById(1);
    let shouldReply = false;

    for (let user of message.mentions.users) {
      if (user.shift() === pat.d_user_id) {
        return;
      }

      if (user.shift() === client.user.id) {
        shouldReply = true;
      }
    }

    if (shouldReply) {
      message.channel.send(`You probably meant to mention <@${pat.d_user_id}>`);
    }
  });
}

async function handleGalleryReaction(messageReaction, user) {
  const galleryType = messageReaction.message.content.split(':')[1];

  if (galleryType === 'Arkham') {
    handleArkhamGalleryReaction(messageReaction, user);
  }
}

async function handleArkhamGalleryReaction(messageReaction, user) {
  const oldCardId = messageReaction.message.content.split(':')[3];
  const deckId = messageReaction.message.content.split(':')[2];
  const deck = await ArkhamResources.getDeck(deckId);

  const cardIds = Object.keys(deck.slots);

  let prevOrNext = (messageReaction.emoji.name === '◀️' ? -1 : 1);

  let currentCardIndex = cardIds.findIndex((id) => {return id === oldCardId});
  let cardId = cardIds[(currentCardIndex + prevOrNext + cardIds.length) % cardIds.length];
  const code = ArkhamResources.getEmbedGalleryCode(deckId, cardId);

  const embed = ArkhamResources.createEmbedForDeck(deck, cardId);

  messageReaction.message.edit(code, embed);
}

async function checkForGameUpdates() {
  if (isBedtime()) {
    return;
  }

  const games = await DatabaseResources.getPlayableGames();

  for (let game of games) {
    const usersToNotify = await DatabaseResources.getUsersSubscribedToGame(game.id);

    // no users to notify, so exit early
    if (!usersToNotify.length) {
      continue;
    }

    let rss = await SteamResources.getRssFeedForGame(game.steam_game_id);

    // get all updates from rss & isolate IDs
    const updates = rss.channel[0].item;
    const updateIds = updates.map((update) => {
      return update.link[0].split('/').slice(-1)[0];
    });

    // get all existing updates in the database using the updateIds
    const existingUpdateIds = await DatabaseResources.getGameUpdates(updateIds).then((existingUpdates) => {
      return existingUpdates.map((update) => {
        return update.steam_game_update_id;
      });
    });

    // filter out any existing updates that are already in the database
    const newUpdates = updates.filter((update) => {
      const updateId = SteamResources.parseUpdateIdFromRss(update);
      return !existingUpdateIds.includes(updateId);
    });

    if (!newUpdates.length) {
      continue;
    }

    let updateMessage = `New update${newUpdates.length > 1 ? 's' : ''} for ${game.name}! \n`;
    for (let user of usersToNotify) {
      updateMessage += `<@${user.d_user_id}> `;
    }
    updateMessage += '\n';

    for (let update of newUpdates) {
      const updateLink = update.link[0];

      updateMessage += `\n${updateLink}`;

      const updateId = SteamResources.parseUpdateIdFromRss(update);
      DatabaseResources.insertGameUpdate(game.id, updateId);
    }

    client.channels.cache.get(GAME_UPDATE_CHANNEL_ID).send(updateMessage);
  }
}

function isBedtime() {
  const timeFormat = 'HH:mm:ss';
  const start = '02:00:00';
  const end = '09:00:00';

  return moment().isBetween(moment(start, timeFormat), moment(end, timeFormat));
}

module.exports = {
  login: login
};