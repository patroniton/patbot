const Commando = require('discord.js-commando');
const moment = require('moment');
const DatabaseResources = require('../../DatabaseResources');
const WeatherResoures = require('../../WeatherResoures');

const icons = {
  '01d': '☀️',
  '02d': '⛅',
  '03d': '☁️',
  '04d': '☁️',
  '09d': '🌧️',
  '10d': '🌦️',
  '11d': '⛈️',
  '13d': '🌨️',
  '50d': '🌫️',
  '01n': '🌑',
  '02n': '⛅',
  '03n': '☁️',
  '04n': '☁️',
  '09n': '🌧️',
  '10n': '🌦️',
  '11n': '⛈️',
  '13n': '🌨️',
  '50n': '🌫️'
}

module.exports = class Weather extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'weather',
      group: 'misc',
      memberName: 'weather',
      description: 'Weather information about user, or city provided. Use "all" to view all users weather data.'
    });
  }

  async run(message, args) {
    try {
      let promises = [];
      let weatherData = [];

      // determine what weather to get. All users, single user, or a city
      if (args === 'all') {
        weatherData = await DatabaseResources.getAllWeatherData();
      } else if (args.length > 0) { // user specified a city
        weatherData.push({name: args, city: args});
      } else {
        weatherData = await DatabaseResources.getWeatherDataForDiscordUser(message.author.id);
      }

      let allWeather = [];

      for (let weather of weatherData) {
        let promise = WeatherResoures.getWeatherForCity(weather.city).then((cityWeather) => {
          cityWeather.name = weather.name;
          allWeather.push(cityWeather);
        });

        promises.push(promise);
      }

      await Promise.all(promises);

      // March - September = high to low, October - February = low to high
      const sortAsc = (new Date()).getMonth() >= 9 || (new Date()).getMonth() <= 1;
      allWeather = allWeather.sort((a, b) => {
        if (a.main.temp < b.main.temp) {
          return 1;
        }

        return -1;
      });

      if (!sortAsc) {
        allWeather.reverse();
      }

      let reply = '';
      for(let weather of allWeather) {
        if (weather.main) {
          let temp = weather.main.temp;

          let icon = icons[weather.weather[0].icon];

          if (!icon) {
            icon = '';
          }

          reply += `${icon} ${weather.name}: ${this.roundHalf(temp)}C/${this.roundHalf(this.celsiusToFahrenheit(temp))}F ${icon}\n`;
        }
      }

      if (reply === '') {
        reply = 'Whoops! No data came back for that argument. Try again or report a bug.';
      }

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }

  celsiusToFahrenheit(c) {
    return (c * 9 / 5) + 32;
  }

  roundHalf(number) {
    return Math.round(number * 2) / 2;
  }
}

