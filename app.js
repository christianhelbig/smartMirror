const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
    fs = require('fs');
    http = require('http').createServer(app),
    io = require('socket.io')(http);

let weather = require('./modules/weather.js'),
    calendar = require('./modules/calendar.js'),
    reminders = require('./modules/reminders.js'),
    sensors = require('./modules/sensors.js'),
    departures = require('./modules/public_transport.js');

// Load settings
let settings = require('./default.config');
try {
    if (fs.existsSync('./config.js')) settings = require('./config');
} catch(err) {
    console.error(err)
}

// START SERVER
http.listen(3000, function () {
    console.log('App listening on port 3000!');
});

// ROUTING
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('webfiles'));

app.get('/', function (req, res) {
    res.redirect('main.html');
});

app.post('/sensor_readings', (req, res) => sensors.receiveData(req, res));

// Web socket
io.on('connection', function(socket){
    console.log(socket.handshake.address + ' connected');

    // send stored weather data
    weather.sendStoredCurrentWeather(socket);
    weather.sendStoredWeatherForecast(socket);
    calendar.sendStoredCalendarData(socket);
    reminders.sendStoredRemindersData(socket);
    sensors.sendStoredSensorData(socket);
    departures.getTransportData();

    socket.on('calendar_data', function(){
        calendar.getCalendarData(settings.calendar.url, socket);
    })
});


// Request current data
weather.getCurrentWeatherData(settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit);
weather.getWeatherForecastData(settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit);
calendar.getCalendarData(settings.calendar.url);
reminders.getRemindersData(settings.reminders.url);
departures.getTransportData(settings.public_transport.stationID, settings.public_transport.results);

setInterval(weather.getCurrentWeatherData, 1000 * 60 * 10, settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit); // call every 10 min
setInterval(weather.getWeatherForecastData, 1000 * 60 * 10, settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit); // call every 10 min
setInterval(calendar.getCalendarData, 1000 * 60 * 5, settings.calendar.url); // call every 5 min
setInterval(reminders.getRemindersData, 1000 * 60 * 5, settings.reminders.url); // call every 5 min
setInterval(departures.getTransportData, 1000 * 30, settings.public_transport.stationID, settings.public_transport.results); // call every 30 seconds