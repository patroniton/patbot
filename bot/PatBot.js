const path = require('path');
const moment = require('moment');
const token = require('./../token.js');
const SteamResources = require('./SteamResources.js');
const DatabaseResources = require('./DatabaseResources.js');
const ArkhamResources = require('./ArkhamResources.js');
const MusicPlayer = require('./MusicPlayer.js');
const MessageHandler = require('./MessageHandler.js');
const { getRandomVoiceDrop } = require("./RandomDrops");

const Commando = require('discord.js-commando');
const client = new Commando.CommandoClient({
  owner: token.owner,
  commandPrefix: '!'
});

const constants = require('./../env');
const GAME_UPDATE_CHANNEL_ID = constants[constants.env].discord_ids.game_update_channel_id;
const LULDOLLAR_USER_ID = constants[constants.env].discord_ids.luldollar_user_id;
const LULDOLLAR_EMOJI_ID = constants[constants.env].discord_ids.luldollar_emoji_id;
const GENERAL_CHANNEL_ID = constants[constants.env].discord_ids.general_channel_id;

const GAME_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes
const VOICE_DROP_INTERVAL = (1000 * 60 * 5) + 1; // 5 minutes (added 2 seconds due to double timers in PatBot & in RandomDrop)

let activeGalleries = {
  arkham: false
};

function login(token) {
  client.login(token);

  init();
}

function init() {
  // this is to solve needing data persisted through the bot (but without using a database)
  // should find a way around this if possible, but works for now
  client.patbot = {};
  client.patbot.startTime = moment();
  client.patbot.musicPlayer = new MusicPlayer(client);

  registerEvents();
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
    setInterval(giveVoiceDrops, VOICE_DROP_INTERVAL);
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

  client.on('message', async message => MessageHandler.handleMessage(message));
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

async function giveVoiceDrops() {
  const voiceChannels = client.guilds.cache.first().channels.cache.filter(channel => channel.type === 'voice');
  const generalChannel = client.guilds.cache.first().channels.cache.filter(channel => channel.id === GENERAL_CHANNEL_ID).first();

  // TODO: move messages into the random drop logic so that it can use custom responses based on what happened
  const messageResponses = [
    "While sitting in the voice channel @USER@ found a @EMOJI@!",
    "@USER@ randomly looked around on the floor and found a @EMOJI@! Who dropped that?",
    "Hey @USER@! Did you drop this? @EMOJI@",
    "Can we get some love for @USER@ who just found a @EMOJI@???",
    "What are the odds? @USER@ just stumbled across a @EMOJI@!",
    "Pssssttt.. hey... hey @USER@.. take this @EMOJI@ while no one is looking",
    "Just gonna sliiiide this @EMOJI@ on into @USER@'s pocket",
    "A random @EMOJI@ flew out of the air and hit @USER@ in the face! Unlucky!.. or is it?",
    "WHOA! @USER@ just headshot a bird carrying a @EMOJI@! 🐦🔫",
    "@USER@ saw something shiny out of the corner of their eye... looks like it's a @EMOJI@!",
    "Greed is good, so take this @EMOJI@ @USER@.",
    "It's dangerous to go alone! Take this @EMOJI@ @USER@",
    "I'm feeling generous - take this @EMOJI@ @USER@. Don't spend it all in one place, unless it's on blackjack and hookers.",
    "SOMEONE GET @USER@ A @EMOJI@ PRONTO!",
    "Hmm.. must be a glitch in the system, because @USER@ just found something they weren't supposed to.. a @EMOJI@!",
    "HEY! HEY GET BACK HERE! @USER@ just stole a @EMOJI@ from the vault. Bastard."
  ];

  for (const [id, voiceChannel] of voiceChannels) {
    let usersInVoice = voiceChannel.members.filter(member => !member.user.bot);

    // only allow drops when multiple users in voice - otherwise could afk
    if (usersInVoice.size > 2) {
      for (const [id, user] of usersInVoice) {
        let drop = getRandomVoiceDrop(user.user.id);

        if (drop !== null) {
          let message = messageResponses.random().replace('@USER@', `<@${user.user.id}>`).replace('@EMOJI@', drop.emoji);
          
          let dbUser = await DatabaseResources.getUserByDiscordId(user.user.id);

          if (dbUser) {
            generalChannel.send(message).then(sent => {
              DatabaseResources.insertRandomDrop(dbUser.id, drop.id, sent.url);
            });
          }
        }
      }
    }
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