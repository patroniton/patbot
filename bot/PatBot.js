const path = require('path');
const moment = require('moment');
const token = require('./../token.js');
const SteamResources = require('./SteamResources.js');
const DatabaseResources = require('./DatabaseResources.js');
const ArkhamResources = require('./ArkhamResources.js');
const MusicPlayer = require('./MusicPlayer.js');

const Commando = require('discord.js-commando');
const client = new Commando.CommandoClient({
  owner: token.owner,
  commandPrefix: '!'
});

const constants = require('./../env');
const GAME_UPDATE_CHANNEL_ID = constants[constants.env].discord_ids.game_update_channel_id;
const LULDOLLAR_USER_ID = constants[constants.env].discord_ids.luldollar_user_id;
const LULDOLLAR_EMOJI_ID = constants[constants.env].discord_ids.luldollar_emoji_id;
const GROOVY_BOT_ID = constants[constants.env].discord_ids.groovy_bot_id;

const GAME_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

let activeGalleries = {
  arkham: false
};

function init() {
  // this is to solve needing data persisted through the bot (but without using a database)
  // should find a way around this if possible, but works for now
  client.patbot = {};
  client.patbot.startTime = moment();
  client.patbot.musicPlayer = new MusicPlayer(client);

  registerEvents();
}

function login(token) {
  client.login(token);

  init();
}

function registerEvents() {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.registry
      .registerDefaultTypes()
      .registerDefaultGroups()
      .registerDefaultCommands({
        help: true,
        ping: false,
        prefix: false,
        eval: false,
        unknownCommand: false,
        commandState: false
      })
      .registerGroups([
        ['luldollar', 'luldollar commands'],
        ['steam_game_updates', 'steam game update commands'],
        ['arkham', 'Arkham related commands'],
        ['games', 'Text games to play'],
        ['util', 'Utility commands'],
        ['music', 'Music commands'],
        ['misc', 'Other commands'],
      ])
      .registerCommandsIn(path.join(__dirname, 'cmds'));

    checkForGameUpdates();
    setInterval(checkForGameUpdates, GAME_CHECK_INTERVAL);
  });

  client.on('messageReactionAdd', async (messageReaction, user) => {
    // TODO: music player options react to change options

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
    // TODO: music player options react to change options
   
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
    relayMessageToPat(message);

    deleteGroovyMessages(message);
    deleteMusicPlayerMessages(message);
  });
}

async function relayMessageToPat(message) {
  // relay mention directed at the bot towards pat
  const pat = await DatabaseResources.getUserById(1);
  let shouldReply = false;

  for (let user of message.mentions.users) {
    if (user[0] === pat.d_user_id) {
      return;
    }

    if (user[0] === client.user.id) {
      shouldReply = true;
    }
  }

  if (shouldReply) {
    message.channel.send(`You probably meant to mention <@${pat.d_user_id}>`);
  }
}

function deleteGroovyMessages(message) {
  const groovyCommandsToDelete = ['play', 'remove', 'prev', 'previous', 'next', 'song', 'skip', 'queue', 'back', 'clear', 'loop', 'jump', 'pause', 'stop', 'resume', 'join', '-seek', 'rewind', 'fastforward', 'move'];
  let isGroovyCommand = false;

  if (message.content.startsWith('-')) {
    const command = message.content.split('-')[1].split(' ')[0];

    if (groovyCommandsToDelete.includes(command.toLowerCase())) {
      isGroovyCommand = true;
    }
  }

  if (message.author.id !== GROOVY_BOT_ID && !isGroovyCommand) {
    return;
  }

  message.react(['🌋', '💥', '💀', '☠️', '⚔️', '🗡️', '🩸', '🔫'].random());
  message.delete({ timeout: 1000 * 60 });
}

function deleteMusicPlayerMessages(message) {
  const commandsToDelete = ['musicoptions', 'play', 'remove', 'previous', 'next', 'song', 'skip', 'queue', 'back', 'clear', 'loop', 'jump', 'pause', 'stop', 'resume', 'join', '-seek', 'rewind', 'fastforward', 'move'];
  let isCommand = false;

  if (message.content.startsWith('!')) {
    const command = message.content.split('!')[1].split(' ')[0];

    if (commandsToDelete.includes(command.toLowerCase())) {
      isCommand = true;
    }
  }

  if (isCommand) {
    message.react(['🌋', '💥', '💀', '☠️', '⚔️', '🗡️', '🩸', '🔫'].random());
    message.delete({ timeout: 1000 * 60 });
  }
}

async function handleGalleryReaction(messageReaction, user) {
  const galleryType = messageReaction.message.content.split(':')[1];

  let prevOrNext = (messageReaction.emoji.name === '◀️' ? -1 : 1);

  if (galleryType === 'Arkham') {
    handleArkhamGalleryReaction(messageReaction, user, prevOrNext);
  }
}

async function handleArkhamGalleryReaction(messageReaction, user, prevOrNext) {
  if (activeGalleries.arkham) {
    console.log(`${user.id} rate limiting Arkham deck`);
    return;
  }

  activeGalleries.arkham = true;
  setTimeout(() => {
    activeGalleries.arkham = false;
  }, 1000);

  const oldCardId = messageReaction.message.content.split(':')[3];
  const deckId = messageReaction.message.content.split(':')[2];
  const deck = await ArkhamResources.getDeck(deckId);

  const cardIds = Object.keys(deck.slots);

  let currentCardIndex = cardIds.findIndex((id) => {return id === oldCardId});
  let cardId = cardIds[(currentCardIndex + prevOrNext + cardIds.length) % cardIds.length];

  const code = ArkhamResources.getEmbedGalleryCode(deckId, cardId);
  const embed = ArkhamResources.createEmbedForDeck(deck, cardId);

  messageReaction.message.edit(code, embed);
}

// TODO: refactor this janky fucky mess
async function checkForGameUpdates() {
  if (isBedtime()) {
    return;
  }

  const games = await DatabaseResources.getPlayableGames();

  // TODO: should batch the games in sets of 10 or something
  // eg. do 10 game updates, then wait 1 minute, then do next 10, etc.

  for (let game of games) {
    const usersToNotify = await DatabaseResources.getUsersSubscribedToGame(game.id);

    // no users to notify, so exit early
    if (!usersToNotify.length) {
      continue;
    }

    let rss = await SteamResources.getRssFeedForGame(game.steam_game_id);

    // get all updates from rss & isolate IDs
    const updates = rss.channel[0].item;

    if (!updates) {
      continue;
    }

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

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
}

module.exports = {
  login: login
};