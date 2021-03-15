//var weatherResultsEl = $('#weather-results');
var searchButton = document.querySelector('#search-button');
var searchZip = document.querySelector('#zipcode');

const apiKey = '5beadefa1274fa7b1d6019608525655d';
var apiUrl = 'http://api.openweathermap.org/data/2.5/forecast/';

var weatherFormEl = $('weather-form');



function getWeatherForecastZipCode(event) {
    event.preventDefault();
    var searchZipText = searchZip.value;
    console.log(searchZipText);
    
    var zipUrl = apiUrl + '?zip=' + searchZipText + ',us&appid=' + apiKey;

    fetch(zipUrl)
        .then(function (response) {
            console.log("resp");
            console.log(response);
            return response.json();
        }
    ).then(weather => {
        console.log(weather);
        console.log("city");
        console.log(weather.city);
        console.log("list");
        console.log(weather.list);
        weather.list.forEach(element => {
            console.log("weather...");
            console.log(element);
        });
        })
}

searchButton.addEventListener("click", getWeatherForecastZipCode);