const DatabaseResources = require("./DatabaseResources");
const { getRandomDrop } = require("./RandomDrops");

const constants = require('./../env');
const GROOVY_BOT_ID = constants[constants.env].discord_ids.groovy_bot_id;

async function handleMessage(message) {
  relayMessageToPat(message);

  deleteGroovyMessages(message);
  deleteMusicPlayerMessages(message);

  giveRandomDrop(message);
}

async function relayMessageToPat(message) {
  // relay mention directed at the bot towards pat
  const pat = await DatabaseResources.getUserById(1);
  let shouldReply = false;

  for (let user of message.mentions.users) {
    if (user[0] === pat.d_user_id) {
      return;
    }

    if (user[0] === constants[constants.env].discord_ids.patbot_id) {
      shouldReply = true;
    }
  }

  if (shouldReply) {
    message.channel.send(`You probably meant to mention <@${pat.d_user_id}>`);
  }
}

async function deleteGroovyMessages(message) {
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

async function deleteMusicPlayerMessages(message) {
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

async function giveRandomDrop(message) {
  const drop = getRandomDrop(message);

  if (!drop) {
    return;
  }

  const user = await DatabaseResources.getUser(message.author.id);

  if (!user) {
    return;
  }

  DatabaseResources.insertRandomDrop(user.id, getMessageLink(message), drop.chance);

  message.react(drop.emoji);
}

function getMessageLink(message) {
  return `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
}

module.exports = {
  handleMessage
};