const moment = require('moment');
const DatabaseResources = require('../bot/DatabaseResources.js');
const SECONDS_BETWEEN_MESSAGE_DROP_CHANCES = 2;
const MINUTES_BETWEEN_VOICE_DROP_CHANCES = 5;

let userMessageCooldown = {};
let userVoiceCooldown = {};
let randomDropTypes = null;

async function init() {
  randomDropTypes = await DatabaseResources.getRandomDropTypes();
}

function getRandomMessageDrop(message) {
  const discordUserId = message.author.id;

  return userCanReceiveMessageDrops(discordUserId) ? getDrop() : null;
}

function getRandomVoiceDrop(discordUserId) {
  return userCanReceiveVoiceDrops(discordUserId) ? getDrop() : null;
}

function userCanReceiveMessageDrops(discordUserId) {
  // add the user if they're currently not being tracked.
  if (!userMessageCooldown[discordUserId]) {
    userMessageCooldown[discordUserId] = moment();
  }

  const lastMessageTime = userMessageCooldown[discordUserId];

  // last message was less than 30 seconds ago, so user is not eligile for another drop
  if (moment.duration(moment().diff(lastMessageTime)).asSeconds() < SECONDS_BETWEEN_MESSAGE_DROP_CHANCES) {
    return false;
  }

  userMessageCooldown[discordUserId] = moment();
  return true;
}

// TODO: very similar to message drops, need to figure out a way to combine
function userCanReceiveVoiceDrops(discordUserId) {
  // add the user if they're currently not being tracked.
  if (!userVoiceCooldown[discordUserId]) {
    userVoiceCooldown[discordUserId] = moment();
  }

  const lastVoiceDropChance = userVoiceCooldown[discordUserId];

  if (moment.duration(moment().diff(lastVoiceDropChance)).asMinutes() < MINUTES_BETWEEN_VOICE_DROP_CHANCES) {
    return false;
  }

  userVoiceCooldown[discordUserId] = moment();
  return true;
}

function getDrop() {
  for (let randomDropType of randomDropTypes) {
    let roll = Math.floor(Math.random() * randomDropType.chance);

    if (roll === 0) {
      return randomDropType;
    }
  }

  return null;
}

init();

module.exports = {
  getRandomMessageDrop: getRandomMessageDrop,
  getRandomVoiceDrop: getRandomVoiceDrop
};