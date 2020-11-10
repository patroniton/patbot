module.exports = {
  prod: {
    database: {
      host: 'localhost',
      user: 'root',
      password: 'root'
    },
    discord_ids: {
      game_update_channel_id: '758864061789110302',
      luldollar_user_id: '132607164580626442',
      luldollar_emoji_id: '353379669770502144',
      pat_user_id: '113878392276910084'
    }
  },
  dev: {
    database: {
      host: 'localhost',
      user: 'root',
      password: 'root'
    },
    discord_ids: {
      game_update_channel_id: '758467861374173234',
      luldollar_user_id: '113878392276910084',
      luldollar_emoji_id: '663572026220609577',
      pat_user_id: '113878392276910084'
    }
  },
  env: 'prod',
  weather_api_key: 'asdf1234'
};