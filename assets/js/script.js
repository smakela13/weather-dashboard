// query selectors and global variables
var searchButton = document.querySelector('#search-button');
var searchZip = document.querySelector('#zipcode');
var weatherCards = $('#weather-cards');
var forecastDays = 5;
var forecastOffset = 4; // daily forecast that displays to user (3PM)

// API key data
const apiKey = '5beadefa1274fa7b1d6019608525655d';

// uses AJAX to fetch all necessary data from the ZIP code 
function getWeatherForecastZipCode(chosenZip = undefined) {
    var searchZipText = searchZip.value;
    if (chosenZip) {
        searchZipText = chosenZip;
    }
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/forecast/?zip=' + searchZipText + ',us&units=imperial&appid=' + apiKey,
        type: "GET",
    }).then(function (forecastWeather) {
        var lat = forecastWeather.city.coord.lat;
        var lon = forecastWeather.city.coord.lon;
    
        $.ajax({
            url: 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=hourly,daily&appid=' + apiKey,
            type: "GET",
        }).then(fetchedCurrentWeather => {
            displayForecast(forecastWeather, fetchedCurrentWeather);
            saveZipToQuickList(searchZipText);
            populateQuickSearch();
        });
    });
}

// retrieves stored ZIP code entries from local storage
function getStoredZipEntries() {
    var storedEntry = JSON.parse(localStorage.getItem('zipData'));
    if (storedEntry) {
        return storedEntry;
    } else {
        return [];
    }
}

// saves the user's ZIP code to local storage
function saveZipToQuickList(zipEntry) {
    var store = getStoredZipEntries();
    var inList = false;
    store.forEach(element => {
        if (element == zipEntry) {
            inList = true;
        }
    });
    if (!inList) {
        store.push(zipEntry);
    }
    localStorage.setItem('zipData', JSON.stringify(store));
}

// allows user to use sidebar for quick access to past results
function quickSearchPressed(event) {
    getWeatherForecastZipCode(event.target.textContent);
}

// builds sidebar for user's past searches
function populateQuickSearch() {
    var stored = getStoredZipEntries();
    var quickSearchSection = $('#previously-searched');
    quickSearchSection.empty();
    stored.forEach(store_item => {
        var newQuickSearch = $('<li>');
        newQuickSearch.addClass('collection-item');
        newQuickSearch.text(store_item);
        newQuickSearch.on("click", quickSearchPressed);
        quickSearchSection.append(newQuickSearch);
    });
}

// attaches icon to the page
function attachWeatherImage(ref, imageID) {
    var img = new Image();
    var sourceBase = "http://openweathermap.org/img/wn/";
    var sourceEnd = "@2x.png";
    var imageURL = sourceBase + imageID + sourceEnd;
    img.src = imageURL;
    ref.append(img);
}

// shows the city's current weather for the user's ZIP code
function setCityWeather(cityData, currentWeather) {
    var cityNameEl = document.querySelector('#city-name');
    var cityDateEl = document.querySelector('#city-date');
    var currentDate = new Date().toLocaleDateString("en-US");
    var currentTempEl = document.querySelector('#temperature');
    var currentHumidityEl = document.querySelector('#humidity');
    var currentWindSpeedEl = document.querySelector('#wind-speed');
    var currentUVIndexEl = document.querySelector('#uv-index');
    var currentUVIndexColorEl = document.querySelector('#uv-color');
    
    currentUVIndexColorEl.classList.forEach(colorClass => {
        currentUVIndexColorEl.classList.remove(colorClass);
    });

    cityNameEl.textContent = cityData.name + " ";
    cityDateEl.textContent = currentDate;

    var weatherContainer = $('#weather-container');
    weatherContainer.css({
        border: "solid black 1px",
        padding: "0 0 15px 15px",
        margin: "20px 0 10px",
    });

    currentTempEl.textContent = "Temperature: " + currentWeather.current.temp + " °F";
    currentHumidityEl.textContent = "Humidity: " + currentWeather.current.humidity + "%";
    currentWindSpeedEl.textContent = "Wind Speed: " + currentWeather.current.wind_speed + " MPH";
    currentUVIndexEl.textContent = "UV Index: ";
    currentUVIndexColorEl.textContent = currentWeather.current.uvi;
    var uviColor = 'green';
    if (currentWeather.current.uvi <= 2) {
        uviColor = 'green';
    } else if (currentWeather.current.uvi > 2 && currentWeather.current.uvi <= 5) {
        uviColor = 'orange';
    } else {
        uviColor = 'red';
    }
    currentUVIndexColorEl.classList.add(uviColor, 'btn');

    currentWeather.current.weather.forEach(element => {
        attachWeatherImage(cityNameEl, element.icon);
    });
}

// creates the forecast cards
function fillDayWeather(weatherDataForDay, rowRef, forecastRequested) {
    var data = weatherDataForDay[forecastRequested];
    var cardDiv = $('<div>');
    var cardInnerDiv = $('<div>');
    var cardSpan = $('<span>');

    cardDiv.addClass("col s5 m6 l2");
    cardInnerDiv.addClass("card-panel center cyan darken-2");
    cardSpan.addClass('white-text');
    var timeStamp = new Date(data.dt_txt);
    var timeSet = timeStamp.toDateString();

    var temp = "Temp: " + data.main.temp + " °F";
    var humidity = "Humidity " + data.main.humidity + "%";
    var output = timeSet + "<br /><br />" + temp + "<br /><br />" + humidity + "<br />";

    cardSpan.html(output);
    data.weather.forEach(element => {
        attachWeatherImage(cardSpan, element.icon);
    });
    rowRef.append(cardDiv);
    cardDiv.append(cardInnerDiv);
    cardInnerDiv.append(cardSpan);
}

// gets the forecast data
function getDayForecasts(weatherData, entriesInDay, dayNumber) {
    var dayData = [];
    var startVal = 0 + entriesInDay * dayNumber;
    var endVal = startVal + entriesInDay;

    if (endVal > weatherData.length) {
        endVal = weatherData.length;
    }

    for (let k = startVal; k < endVal; k++) {
        dayData.push(weatherData[k]);
    }
    return dayData;
}

// displays the forecast cards
function displayForecast(forecastRawData, currentWeatherData) {
    var forecastsPerDay = 8;
    setCityWeather(forecastRawData.city, currentWeatherData);
    weatherCards.empty();
    var forecastHeader = $("#forecast-header");
    forecastHeader.text("5-Day Forecast");

    for (let i = 0; i < forecastDays; i++) {
        var daysData = getDayForecasts(forecastRawData.list, forecastsPerDay, i);
        fillDayWeather(daysData, weatherCards, forecastOffset);
    }
}

// event listener for the button that allows all necessary data to be fetched
searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    getWeatherForecastZipCode();
});

// calls the function to populate the sidebar
populateQuickSearch();