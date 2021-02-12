const { createWorker } = require('tesseract.js');
const DatabaseResources = require('./DatabaseResources.js');

function getStatsRectanglesForSize(height, width) {
  if (!height || !width) {
    return null;
  }

  if (height === 1080 && width === 1920)  {
    return get1080pRectangles();
  }
  
  if (height === 1440 && width === 2560) {
    return get1440pRectangles();
  }
}

function get1080pRectangles() {
  const PLACE_LEFT = 1513;
  const TOTAL_KILLS_LEFT = 1725;
  const GENERAL_TOP = 128;
  const GENERAL_WIDTH = 80;
  const GENERAL_HEIGHT = 51;

  // height and width stay the same when drawing the box around the numbers
  const HEIGHT = 30;
  const WIDTH = 75;
  const NAME_WIDTH = 210;
  
  // represents the x coordinate of where to start drawing the box for each player
  // each player's data is aligned horizontally, so these don't change
  const P1_LEFT = 131;
  const P2_LEFT = 734;
  const P3_LEFT = 1332;

  // represents the y coordinate of where to start drawing the box for each stat
  // each stat is aligned vertically, so these don't change
  const NAME_TOP = 285;
  const KILLS_TOP = 400;
  const DAMAGE_TOP = 478;
  const SURVIVAL_TIME_TOP = 554;
  const REVIVE_GIVEN_TOP = 630;
  const RESPAWN_GIVEN_TOP = 706;

  const general = [
    {left: PLACE_LEFT, top: GENERAL_TOP, width: GENERAL_WIDTH, height: GENERAL_HEIGHT},
    {left: TOTAL_KILLS_LEFT, top: GENERAL_TOP, width: GENERAL_WIDTH, height: GENERAL_HEIGHT},
  ]

  const player1 = [
    {left: P1_LEFT, top: NAME_TOP, width: NAME_WIDTH, height: HEIGHT},
    {left: P1_LEFT, top: KILLS_TOP, width: WIDTH, height: HEIGHT},
    {left: P1_LEFT, top: DAMAGE_TOP, width: WIDTH, height: HEIGHT},
    {left: P1_LEFT, top: SURVIVAL_TIME_TOP, width: WIDTH, height: HEIGHT},
    {left: P1_LEFT, top: REVIVE_GIVEN_TOP, width: WIDTH, height: HEIGHT},
    {left: P1_LEFT, top: RESPAWN_GIVEN_TOP, width: WIDTH, height: HEIGHT}
  ];

  const player2 = [
    {left: P2_LEFT, top: NAME_TOP, width: NAME_WIDTH, height: HEIGHT},
    {left: P2_LEFT, top: KILLS_TOP, width: WIDTH, height: HEIGHT},
    {left: P2_LEFT, top: DAMAGE_TOP, width: WIDTH, height: HEIGHT},
    {left: P2_LEFT, top: SURVIVAL_TIME_TOP, width: WIDTH, height: HEIGHT},
    {left: P2_LEFT, top: REVIVE_GIVEN_TOP, width: WIDTH, height: HEIGHT},
    {left: P2_LEFT, top: RESPAWN_GIVEN_TOP, width: WIDTH, height: HEIGHT}
  ];

  const player3 = [
    {left: P3_LEFT, top: NAME_TOP, width: NAME_WIDTH, height: HEIGHT},
    {left: P3_LEFT, top: KILLS_TOP, width: WIDTH, height: HEIGHT},
    {left: P3_LEFT, top: DAMAGE_TOP, width: WIDTH, height: HEIGHT},
    {left: P3_LEFT, top: SURVIVAL_TIME_TOP, width: WIDTH, height: HEIGHT},
    {left: P3_LEFT, top: REVIVE_GIVEN_TOP, width: WIDTH, height: HEIGHT},
    {left: P3_LEFT, top: RESPAWN_GIVEN_TOP, width: WIDTH, height: HEIGHT}
  ];

  return {
    general: general,
    players: {
      left: player1,
      middle: player2,
      right: player3
    }
  }
}

async function getStatsFromImageUrl(url, height, width) {  
  const rectangles = getStatsRectanglesForSize(height, width);

  const worker = createWorker({
    logger: m => console.log(m)
  });

  const process = async () => {
    const allStats = [];
    let playerStats = [];
    let generalStats = [];

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    for (let general of Object.values(rectangles.general)) {
      const { data: { text } } = await worker.recognize(url, { rectangle: general });
      generalStats.push(text.replace(/(?:\r\n|\r|\n)/g, ''));
    }

    allStats.push(generalStats);

    for (let player of Object.values(rectangles.players)) {
      // process the name first since that will have alpha-numeric characters
      await worker.setParameters({ tessedit_char_whitelist: '' });
      const { data: { text } } = await worker.recognize(url, { rectangle: player.shift() });
      playerStats.push(text.replace(/(?:\r\n|\r|\n)/g, ''));

      // rest of data is only numeric (and : character for survival time)
      await worker.setParameters({ tessedit_char_whitelist: ':0123456789' });

      for(let rectangle of player) {
        const { data: { text } } = await worker.recognize(url, { rectangle });
        playerStats.push(text.replace(/(?:\r\n|\r|\n)/g, ''));
      }

      allStats.push(playerStats);
      playerStats = [];
    }

    await worker.terminate();

    return allStats;
  }

  return await process();
}

async function getGameDisplayText(apexGame) {
  const stats = await DatabaseResources.getApexGameStatsForGame(apexGame.id);
  const STAT_COLUMN_LENGTH = 8;
  const LEGEND_COLUMN_LENGTH = 10;
  const pog = '<:PogChamp:809845794856763443>';

  let fullLength = 37;
  let headerBorder = '==================================='

  let headerText = 'LOSERS OF THE ARENA';
  let reply = '```m'

  if (apexGame.place === 1) {
    reply += 'l';
    headerText = `CHAMPIONS OF THE ARENA`;
  } else if (apexGame.place === 2) {

  }

  let preferredNicknames = await DatabaseResources.getPreferredNicknames();

  // add another length for each nickname with an odd number
  // since that will increase the stat column length
  // because we want the names to be centred
  for (preferredNickname of preferredNicknames) {
    fullLength += (preferredNickname.nickname.length % 2);
    headerBorder += '=';
  }

  // HEADER
  reply += `\n|${padStartEnd(headerBorder, fullLength)}|\n`;
  reply += `|${padStartEnd(headerText, fullLength)}|`;
  reply += `\n|${padStartEnd(headerBorder, fullLength)}|\n`;

  // NAME ROW
  reply += '| -------- '
  for (let playerStats of stats) {
    let preferredNickname = preferredNicknames.find(nickname => nickname.user_id === playerStats.user_id);
    reply += `|${padStartEnd(preferredNickname.nickname, STAT_COLUMN_LENGTH + (preferredNickname.nickname.length % 2))}|`
  }

  // KILLS ROW
  reply += `\n|${' Kills'.padEnd(LEGEND_COLUMN_LENGTH, ' ')}`
  for (let playerStats of stats) {
    let preferredNickname = preferredNicknames.find(nickname => nickname.user_id === playerStats.user_id);
    let kills = playerStats.kills;
    reply += `|${padStartEnd(kills, STAT_COLUMN_LENGTH + (preferredNickname.nickname.length % 2))}|`
  }

  // DAMAGE ROW
  reply += `\n|${' Damage'.padEnd(LEGEND_COLUMN_LENGTH, ' ')}`
  for (let playerStats of stats) {
    let preferredNickname = preferredNicknames.find(nickname => nickname.user_id === playerStats.user_id);
    let damage = playerStats.damage_dealt;
    reply += `|${padStartEnd(damage, STAT_COLUMN_LENGTH + (preferredNickname.nickname.length % 2))}|`
  }

  // ALIVE ROW
  reply += `\n|${' Alive'.padEnd(LEGEND_COLUMN_LENGTH, ' ')}`
  for (let playerStats of stats) {
    let preferredNickname = preferredNicknames.find(nickname => nickname.user_id === playerStats.user_id);
    let alive = playerStats.survival_time;
    reply += `|${padStartEnd(alive, STAT_COLUMN_LENGTH + (preferredNickname.nickname.length % 2))}|`
  }

  // REVIVES ROW
  reply += `\n|${' Revives'.padEnd(LEGEND_COLUMN_LENGTH, ' ')}`
  for (let playerStats of stats) {
    let preferredNickname = preferredNicknames.find(nickname => nickname.user_id === playerStats.user_id);
    let revives = playerStats.revive_given;
    reply += `|${padStartEnd(revives, STAT_COLUMN_LENGTH + (preferredNickname.nickname.length % 2))}|`
  }

  // REVIVES ROW
  reply += `\n|${' Respawns'.padEnd(LEGEND_COLUMN_LENGTH, ' ')}`
  for (let playerStats of stats) {
    let preferredNickname = preferredNicknames.find(nickname => nickname.user_id === playerStats.user_id);
    let respawns = playerStats.respawn_given;
    reply += `|${padStartEnd(respawns, STAT_COLUMN_LENGTH + (preferredNickname.nickname.length % 2))}|`
  }
  reply += `\n|${padStartEnd(headerBorder, fullLength)}|`;

  reply += '```';

// |=========================================|
// |           LOSERS OF THE ARENA           |
// |=========================================|
// | -------- |   Dan   || Marley ||  Billy  |
// | Kills    |    2    ||    8   ||    7    |
// | Damage   |   1057  ||  1417  ||   1523  |
// | Alive    |  17:41  ||  17:41 ||  17:41  |
// | Revives  |    0    ||    0   ||    4    |
// | Respawns |    0    ||    0   ||    0    |
// |=========================================|

  return reply;
}

function padStartEnd(stringToPad, fullLength) {
  const length = stringToPad.toString().length; // fixes numbers, since length is undefined
  const startPad = Math.ceil((fullLength - length) / 2);
  const endPad = Math.floor((fullLength - length) / 2);

  return ' '.repeat(startPad) + stringToPad.toString() + ' '.repeat(endPad);
}

module.exports = {
  getStatsFromImageUrl,
  getGameDisplayText
};