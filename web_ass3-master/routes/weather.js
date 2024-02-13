const express = require("express");
const router = express.Router();
const https = require("https");
const fetch = require("node-fetch");
const unsplashApiKey = "As_rPDDI2zDlPtiXiS0vQ3-Kn4VtkooIjOGM3UoLOsM";
const googlePlacesApiKey = "AIzaSyBSNERGFARriiKLB-9Y82Uv6oUoGvUZUmU";
const covid19ApiUrl = "https://disease.sh/v3/covid-19/countries/";

function convertKelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

router.get("/", (req, res) => {
  const username = req.session.username
  let loggedIn = true
  if (!username) {
    loggedIn = false
    res.render("index", {loggedIn})
  }
  res.render("index", {loggedIn});
});

router.get("/weather", async (req, res) => {
  const username = req.session.username
  let loggedIn = true
  if (!username) {
    res.redirect('/login')
  }

  const apiKey = "14882d9791674ae40196bb2a87f7dd81";
  const city = req.query.city;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

  try {
    if (city !== undefined && city.trim() !== "") {
      const weatherdata = await fetchData(url);

      const temp = convertKelvinToCelsius(weatherdata.main.temp);
      const feelsLike = convertKelvinToCelsius(weatherdata.main.feels_like);
      const description = weatherdata.weather[0].description;
      const icon = weatherdata.weather[0].icon;
      const imgURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      // const covid19Data = await fetch(covid19ApiUrl + city).then((res) =>
      //   res.json()
      // );

      const weatherDetails = {
        temp,
        feelsLike,
        description,
        imgURL,
        city,
        coordinates: weatherdata.coord,
        humidity: weatherdata.main.humidity,
        pressure: weatherdata.main.pressure,
        windSpeed: weatherdata.wind.speed,
        countryCode: weatherdata.sys.country,
        rainVolumeLast3Hours: weatherdata.rain ? weatherdata.rain["3h"] : 0,
        // covid19Stats: {
        //   cases: covid19Data.cases,
        //   deaths: covid19Data.deaths,
        //   recovered: covid19Data.recovered,
        //   active: covid19Data.active,
        //   continent: covid19Data.continent,
        // },
      };

      const unsplashQuery = getUnsplashQueryBasedOnWeather(weatherdata);
      const unsplashData = await fetch(
        `https://api.unsplash.com/photos/random?query=${unsplashQuery}&client_id=${unsplashApiKey}`
      ).then((res) => res.json());

      weatherDetails.unsplashImage = unsplashData.urls.full;

      const placeDetails = await fetchPlaceDetails(city);

      res.render("index", { weather: weatherDetails, placeDetails, loggedIn});
    } else {
      res.render("index", {loggedIn});
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    if (error.message.includes('Failed to load data, status code: 404')) {
      res.render("index", { error: "City not found. Please try a different city name.", loggedIn });
    } else {
      res.render("index", { error: "Internal Server Error. Please try again later.", loggedIn });
    }
  }
});

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed to load data, status code: ' + response.statusCode));
      }
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (error) => reject(error));
  });
}


function fetchPlaceDetails(city) {
  const googlePlacesApiUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${city}&inputtype=textquery&key=${googlePlacesApiKey}`;

  return fetch(googlePlacesApiUrl).then((response) => response.json());
}

function getUnsplashQueryBasedOnWeather(weatherdata) {
  const weatherKeywords = [];

  if (weatherdata.weather[0].main === "Clear") {
    weatherKeywords.push("clear sky");
  } else if (weatherdata.weather[0].main === "Clouds") {
    weatherKeywords.push("cloudy sky");
  } else if (weatherdata.weather[0].main === "Rain") {
    weatherKeywords.push("rainy sky");
  } else if (weatherdata.weather[0].main === "Mist") {
    weatherKeywords.push("mist");
  } else {
    weatherKeywords.push(weatherdata.weather[0].main)
  }

  return weatherKeywords.join(" ");
}

module.exports = router;
