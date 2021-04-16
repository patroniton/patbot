const moment = require('moment');

const ONE_MILLION_DROP = {chance: 'million', emoji: '👑'};
const ONE_HUNDRED_THOUSAND_DROP = {chance: 'hundred_thousand', emoji: '💎'};
const ONE_THOUSAND_DROP = {chance: 'thousand', emoji: '🏆'};
const ONE_HUNDRED_DROP = {chance: 'hundred', emoji: '🧀'};
const SECONDS_BETWEEN_MESSAGE_DROP_CHANCES = 2;
const MINUTES_BETWEEN_VOICE_DROP_CHANCES = 5;

let userMessageCooldown = {};
let userVoiceCooldown = {};

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
  const million = Math.floor(Math.random() * 1000000);
  const hundredThousand = Math.floor(Math.random() * 100000);
  const thousand = Math.floor(Math.random() * 1000);
  const hundred = Math.floor(Math.random() * 100);

  // FOR TESTING
  // const million = Math.floor(Math.random() * 10);
  // const hundredThousand = Math.floor(Math.random() * 5);
  // const thousand = Math.floor(Math.random() * 3);
  // const hundred = Math.floor(Math.random() * 2);

  console.log(`million: ${million}`);
  console.log(`hundredThousand: ${hundredThousand}`);
  console.log(`thousand: ${thousand}`);
  console.log(`hundred: ${hundred}`);

  if (million === 0) {
    return ONE_MILLION_DROP;
  }
  if (hundredThousand === 0) {
    return ONE_HUNDRED_THOUSAND_DROP;
  }
  if (thousand === 0) {
    return ONE_THOUSAND_DROP;
  }
  if (hundred === 0) {
    return ONE_HUNDRED_DROP;
  }

  return null;
}

module.exports = {
  getRandomMessageDrop: getRandomMessageDrop,
  getRandomVoiceDrop: getRandomVoiceDrop
};