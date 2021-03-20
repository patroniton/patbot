const moment = require('moment');

const ONE_MILLION_DROP = {chance: 'million', emoji: '👑'};
const ONE_HUNDRED_THOUSAND_DROP = {chance: 'hundred_thousand', emoji: '💎'};
const ONE_THOUSAND_DROP = {chance: 'thousand', emoji: '🏆'};
const SECONDS_BETWEEN_DROP_CHANCES = 30;

let userIds = {};

function getRandomDrop(message) {
  const discordUserId = message.author.id;

  // add the user if they're currently not being tracked.
  if (!userIds[discordUserId]) {
    userIds[discordUserId] = moment();
  }

  const lastMessageTime = userIds[discordUserId];

  // last message was less than 5 minutes ago, so user is not eligile for another drop
  if (moment.duration(moment().diff(lastMessageTime)).asSeconds() < SECONDS_BETWEEN_DROP_CHANCES) {
    console.log('rate limit on drops');
    return;
  }

  userIds[discordUserId] = moment();

  return getDrop();
}

function getDrop() {
  const million = Math.floor(Math.random() * 1000000);
  const hundredThousand = Math.floor(Math.random() * 100000);
  const thousand = Math.floor(Math.random() * 1000);

  if (million === 0) {
    return ONE_MILLION_DROP;
  }
  if (hundredThousand === 0) {
    return ONE_HUNDRED_THOUSAND_DROP;
  }
  if (thousand === 0) {
    return ONE_THOUSAND_DROP;
  }

  return null;
}

module.exports = {
  getRandomDrop
};