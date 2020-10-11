const mysql = require('promise-mysql');
const constants = require('./../env');
const moment = require('moment');
const env = 'dev';
const dbConnection = constants[env].database;
const DB_NAME = 'patbot';

const GAME_TABLE = 'game';
const GAME_UPDATE_TABLE = 'game_update';
const USER_GAME_SUBSCRIPTION_TABLE = 'user_game_subscription';
const USER_TABLE = 'user';
const LULDOLLAR_TABLE = 'luldollar';
const NICKNAME_TABLE = 'user_nickname';
const AVAILABILITY_TABLE = 'user_availability';

async function getLuldollars() {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT ${USER_TABLE}.name, COUNT(*) AS \`luldollars\` FROM ${LULDOLLAR_TABLE} JOIN ${USER_TABLE} ON ${USER_TABLE}.id = user_id WHERE ${LULDOLLAR_TABLE}.deleted_at IS NULL GROUP BY ${LULDOLLAR_TABLE}.user_id ORDER BY \`luldollars\` DESC`);
  });
}

async function getSteamGame(steamGameId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${GAME_TABLE} WHERE steam_game_id = ${db.escape(steamGameId)}`).then(game => game.shift());
  });
}

async function getPlayableGames(steamGameId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${GAME_TABLE} WHERE playable = 1`);
  });
}

async function getUser(discordUserId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${USER_TABLE} WHERE d_user_id = ${db.escape(discordUserId)}`).then(user => user.shift());
  });
}

async function getUserById(id) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${USER_TABLE} WHERE id = ${db.escape(id)}`).then(user => user.shift());
  });
}

async function getSubscription(gameId, userId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${USER_GAME_SUBSCRIPTION_TABLE} WHERE game_id = ${db.escape(gameId)} AND user_id = ${db.escape(userId)}`).then(sub => sub.shift());
  });
}

async function insertSubscription(gameId, userId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`INSERT INTO ${USER_GAME_SUBSCRIPTION_TABLE} (game_id, user_id) VALUES (${db.escape(gameId)}, ${db.escape(userId)})`);
  });
}

async function deleteSubscription(id) {
  return await wrapTransaction(async (db) => {
    return await db.query(`DELETE FROM ${USER_GAME_SUBSCRIPTION_TABLE} WHERE id = ${db.escape(id)}`);
  });
}

async function insertGame(steamGameId, name) {
  return await wrapTransaction(async (db) => {
    return await db.query(`INSERT INTO ${GAME_TABLE} (steam_game_id, name) VALUES (${db.escape(steamGameId)}, ${db.escape(name)})`);
  });
}

async function insertLuldollar(userId, discordMessageId, isManual = 0) {
  return await wrapTransaction(async (db) => {
    return await db.query(`INSERT INTO ${LULDOLLAR_TABLE} (user_id, d_message_id, is_manual) VALUES ((SELECT id FROM ${USER_TABLE} WHERE d_user_id = ${db.escape(userId)}), ${db.escape(discordMessageId)}, ${isManual})`);
  });
}

async function deleteLuldollar(discordMessageId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`UPDATE ${LULDOLLAR_TABLE} SET deleted_at = now() WHERE d_message_id = ${discordMessageId} AND deleted_at IS NULL`);
  });
}

async function getUsersSubscribedToGame(gameId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT DISTINCT ${USER_TABLE}.* FROM ${USER_TABLE} JOIN ${USER_GAME_SUBSCRIPTION_TABLE} ON ${USER_TABLE}.id = user_id WHERE game_id = ${gameId}`);
  });
}

async function getGameUpdates(updateIds) {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${GAME_UPDATE_TABLE} WHERE steam_game_update_id IN (${db.escape(updateIds)})`);
  });
}

async function insertGameUpdate(gameId, updateId) {
  return await wrapTransaction(async (db) => {
    return await db.query(`INSERT INTO ${GAME_UPDATE_TABLE} (game_id, steam_game_update_id) VALUES (${db.escape(gameId)}, ${db.escape(updateId)})`);
  });
}

async function getNicknames() {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT * FROM ${NICKNAME_TABLE}`);
  });
}

async function insertAvailability(userId, discordMessageId, start, end, percentage = 100, isPresent = 1) {
  return await wrapTransaction(async (db) => {
    return await db.query(`INSERT INTO ${AVAILABILITY_TABLE} (user_id, d_message_id, start, end, percentage, is_present) VALUES (${db.escape(userId)}, ${db.escape(discordMessageId)}, ${db.escape(start)}, ${db.escape(end)}, ${db.escape(percentage)}, ${db.escape(isPresent)})`);
  });
}

async function getFutureAvailabilities(options) {
  if (options === 'all') {
    return await getAllFutureAvailabilities();
  }
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT user.name, user_availability.* FROM ${AVAILABILITY_TABLE} JOIN user ON user.id = ${AVAILABILITY_TABLE}.user_id WHERE end >= '${moment().format('YYYY-MM-DD')}' AND end <= '${moment().add(3, 'day').format('YYYY-MM-DD')}' ORDER BY start, created_at DESC`);
  });
}

async function getAllFutureAvailabilities() {
  return await wrapTransaction(async (db) => {
    return await db.query(`SELECT user.name, user_availability.* FROM ${AVAILABILITY_TABLE} JOIN user ON user.id = ${AVAILABILITY_TABLE}.user_id WHERE end >= '${moment().format('YYYY-MM-DD')}' ORDER BY start, created_at DESC`);
  });
}

async function wrapTransaction(callback) {
  const db = await mysql.createConnection(dbConnection);

  try {
    await db.query(`USE ${DB_NAME}`);

    const result = await callback(db);

    db.end();

    return result;
  } catch(e) {
    db.end();
    console.log(e);
    message.reply('Sorry, something went wrong.');
  }
}

module.exports = {
  getLuldollars: getLuldollars,
  getSteamGame: getSteamGame,
  getUser: getUser,
  getSubscription: getSubscription,
  insertSubscription: insertSubscription,
  deleteSubscription: deleteSubscription,
  insertGame: insertGame,
  insertLuldollar: insertLuldollar,
  deleteLuldollar: deleteLuldollar,
  getPlayableGames: getPlayableGames,
  getUsersSubscribedToGame: getUsersSubscribedToGame,
  getGameUpdates: getGameUpdates,
  insertGameUpdate: insertGameUpdate,
  getNicknames: getNicknames,
  getUserById: getUserById,
  insertAvailability: insertAvailability,
  getFutureAvailabilities: getFutureAvailabilities,
};