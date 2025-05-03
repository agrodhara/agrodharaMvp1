const axios = require('axios');

class WeatherService {
  static async getWeatherData(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            units: 'metric',
            appid: process.env.WEATHER_API_KEY
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather data:", error.response?.data || error.message);
      throw new Error("Failed to fetch weather data");
    }
  }

  static async getWeatherForecast(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat,
            lon,
            units: 'metric',
            appid: process.env.WEATHER_API_KEY || 'ba672f0677f53bb0fd9bb2824773d50a'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather forecast:", error.response?.data || error.message);
      throw new Error("Failed to fetch weather forecast");
    }
  }
}

module.exports = WeatherService;
