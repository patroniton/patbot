const fetch = require('node-fetch');
const weatherApiKey = require('../env').weather_api_key;
const url = `http://api.openweathermap.org/data/2.5/weather?units=metric&appid=${weatherApiKey}&q=`;

async function getWeatherForCity(city) {
  return await fetch(`${url}${city}`)
    .then(response => response.text())
    .then(text => JSON.parse(text));
}

module.exports = {
  getWeatherForCity,
};