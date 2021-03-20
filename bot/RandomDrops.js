const moment = require('moment');

const ONE_MILLION_DROP = '👑';
const ONE_HUNDRED_THOUSAND_DROP = '💎';
const ONE_THOUSAND_DROP = '🏆';
const MINUTES_BETWEEN_DROP_CHANCES = 5;

let userIds = {};

function getRandomDrop(message) {
  const discordUserId = message.author.id;

  // add the user if they're currently not being tracked.
  if (!userIds[discordUserId]) {
    userIds[discordUserId] = moment();
  }

  const lastMessageTime = userIds[discordUserId];

  // last message was less than 5 minutes ago, so user is not eligile for another drop
  if (moment.duration(moment().diff(lastMessageTime)).asMinutes() < MINUTES_BETWEEN_DROP_CHANCES) {
    console.log('rate limit on drops');
    // return;
  }

  return getDrop();
}

function getDrop() {
  // const million = Math.floor(Math.random() * 1000000);
  // const hundredThousand = Math.floor(Math.random() * 100000);
  // const thousand = Math.floor(Math.random() * 1000);

  const million = Math.floor(Math.random() * 10);
  const hundredThousand = Math.floor(Math.random() * 5);
  const thousand = Math.floor(Math.random() * 3);

  console.log(`million: ${million}`);
  console.log(`hundredThousand: ${hundredThousand}`);
  console.log(`thousand: ${thousand}`);

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