/**
 * SmartMirror Application
 *
 * This application was created for a smart mirror project. It displays the time, date, current weather,
 * room temperature, an Apple calendar and current information about the public transport in Berlin, Germany.
 * As soon as I finish building the sensor, it will also display the current well being of my house plants.
 *
 * Copyright (c) 2020 Christian Helbig
 * GitHub: https://github.com/christianhelbig/smartMirror
 *
 * @author Christian Helbig
 * @version 1.0
 * */

// Import necessary node_modules
const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      fs         = require('fs'),
      http       = require('http').createServer(app);
      io         = require('socket.io')(http)

// Import modules
const weather     = require('./modules/weather.js'),
      calendar    = require('./modules/calendar.js'),
      reminders   = require('./modules/reminders.js'),
      sensors     = require('./modules/sensors.js'),
      departures  = require('./modules/public_transport.js')

// Load settings from config file
let settings = require('./default.config.js')
try {
    if (fs.existsSync('./config.js')) settings = require('./config')
} catch(err) {
    console.info("Couldn't find a config file, so I'm using default values. You can copy/past the default" +
        "config and create your own!")
}

// Start server
http.listen(3000, function () {
    console.log('App listening on port 3000!')
})

// Routing
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('webfiles'))

app.get('/reminders_data_example.json', function (req, res) {
    // send example data of reminders
    try {
        let data = fs.readFileSync('./reminders_data_example.json')
        data = JSON.parse(data)
        res.send(data)
    } catch (err) {
        console.error(err)
    }
})

app.get('/', function (req, res) {
    res.redirect('main.html')
})

// Trigger function that processes incoming sensor readings
app.post('/sensor_readings', (req, res) => sensors.receiveData(req, res))

// Web socket
io.on('connection', function(socket){
    console.log(socket.handshake.address + ' connected')

    // Send stored data when new client connects (otherwise APIs might block too many requests)
    weather.sendStoredCurrentWeather(socket)
    weather.sendStoredWeatherForecast(socket)
    calendar.sendStoredCalendarData(socket)
    reminders.sendStoredRemindersData(socket)
    sensors.sendStoredSensorData(socket)
    // this is the only data that is not stored and will be freshly retrieved on each new connect
    departures.getTransportData(settings.public_transport.stationID, settings.public_transport.results)

    socket.on('calendar_data', function(){
        calendar.getCalendarData(settings.calendar.url, socket)
    })
})

io.on('sensor_data', function(socket){
    console.log(socket)
})

// Request current data
weather.getCurrentWeatherData(settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit)
weather.getWeatherForecastData(settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit)
calendar.getCalendarData(settings.calendar.url)
reminders.getRemindersData(settings.reminders.url)
departures.getTransportData(settings.public_transport.stationID, settings.public_transport.results)

// Set up interval function calls
setInterval(weather.getCurrentWeatherData, 1000 * 60 * 10, settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit) // call every 10 min
setInterval(weather.getWeatherForecastData, 1000 * 60 * 10, settings.weather.cityID, settings.weather.apiKey, settings.weather.lang, settings.weather.unit) // call every 10 min
setInterval(calendar.getCalendarData, 1000 * 60 * 5, settings.calendar.url) // call every 5 min
setInterval(reminders.getRemindersData, 1000 * 60 * 5, settings.reminders.url) // call every 5 min
setInterval(departures.getTransportData, 1000 * 30, settings.public_transport.stationID, settings.public_transport.results) // call every 30 seconds