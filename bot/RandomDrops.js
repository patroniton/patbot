const moment = require('moment');

const ONE_MILLION_DROP = {chance: 'million', emoji: '👑'};
const ONE_HUNDRED_THOUSAND_DROP = {chance: 'hundred_thousand', emoji: '💎'};
const ONE_THOUSAND_DROP = {chance: 'thousand', emoji: '🏆'};
const ONE_HUNDRED_DROP = {chance: 'hundred', emoji: '🧀'};
const SECONDS_BETWEEN_DROP_CHANCES = 10;

let userIds = {};

function getRandomDrop(message) {
  const discordUserId = message.author.id;

  // add the user if they're currently not being tracked.
  if (!userIds[discordUserId]) {
    userIds[discordUserId] = moment();
  }

  const lastMessageTime = userIds[discordUserId];

  // last message was less than 30 seconds ago, so user is not eligile for another drop
  if (moment.duration(moment().diff(lastMessageTime)).asSeconds() < SECONDS_BETWEEN_DROP_CHANCES) {
    return;
  }

  userIds[discordUserId] = moment();

  return getDrop();
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
  getRandomDrop
};