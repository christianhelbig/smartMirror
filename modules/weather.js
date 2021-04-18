const request = require('request')
const fs = require('fs')

function getCurrentWeatherData(cityID, apiKey, lang = "de", unit = 'metric') {
    request('https://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&appid=' + apiKey + '&lang=' + lang + '&units=' + unit, { json: true }, (err, res, body) => {
        if (err) { console.log(err)}

        // Add time stamp to data
        body.timestamp = Date.now()

        // Broadcast
        broadcastCurrentWeather(body)

        // Save current response to file
        try {
            fs.writeFileSync('./current_data/current_weather.json', JSON.stringify(body))
        } catch (err) {
            console.error(err)
        }
    })
}

function broadcastCurrentWeather(data) {
    let relevantData = {
        name: data.name,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        temp: Math.round(data.main.temp),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
    }

    // Sends current weather data to all sockets
    io.sockets.emit('current_weather', relevantData)
    console.log("[" + new Date().toISOString() + "] " + "Broadcast current weather")
}

function sendStoredCurrentWeather(socket) {
    // Read weather data from file
    try {
        let data = fs.readFileSync('./current_data/current_weather.json')
        data = JSON.parse(data)

        let relevantData = {
            name: data.name,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            temp: Math.round(data.main.temp),
            min: Math.round(data.main.temp_min),
            max: Math.round(data.main.temp_max),
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset
        }

        socket.emit('current_weather', relevantData)
    } catch (err) {
        console.error(err)
    }
}

function getWeatherForecastData(cityID, apiKey, lang = "de", unit = 'metric') {
    request('https://api.openweathermap.org/data/2.5/forecast/daily?id=' + cityID + '&appid=' + apiKey + '&cnt=5&lang=' + lang + '&units=' + unit, { json: true }, (err, res, body) => {
        if (err) { console.log(err) }

        // Add time stamp to data
        body.timestamp = Date.now()

        // Broadcast
        broadcastWeatherForecast(body)

        // Save current api call to file
        try {
            fs.writeFileSync('./current_data/weather_forecast.json', JSON.stringify(body))
        } catch (err) {
            console.error(err)
        }
    })
}

function broadcastWeatherForecast(data) {
    let relevantData = [
        // day 1
        {
            date: data.list[0].dt,
            min: Math.round(data.list[0].temp.min),
            max: Math.round(data.list[0].temp.max),
            icon: data.list[0].weather[0].icon,
            description: data.list[0].weather[0].description,
        },
        // day 2
        {
            date: data.list[1].dt,
            min: Math.round(data.list[1].temp.min),
            max: Math.round(data.list[1].temp.max),
            icon: data.list[1].weather[0].icon,
            description: data.list[0].weather[0].description,
        },
        // day 3
        {
            date: data.list[2].dt,
            min: Math.round(data.list[2].temp.min),
            max: Math.round(data.list[2].temp.max),
            icon: data.list[2].weather[0].icon,
            description: data.list[0].weather[0].description,
        },
        // day 4
        {
            date: data.list[3].dt,
            min: Math.round(data.list[3].temp.min),
            max: Math.round(data.list[3].temp.max),
            icon: data.list[3].weather[0].icon,
            description: data.list[0].weather[0].description,
        },
        // day 5
        {
            date: data.list[4].dt,
            min: Math.round(data.list[4].temp.min),
            max: Math.round(data.list[4].temp.max),
            icon: data.list[4].weather[0].icon,
            description: data.list[0].weather[0].description,
        }
    ]

    // Sends current weather data to all sockets
    io.sockets.emit('weather_forecast', relevantData)
    console.log("[" + new Date().toISOString() + "] " + "Broadcast weather forecast")
}

function sendStoredWeatherForecast(socket) {
    // Read weather data from file
    try {
        let data = fs.readFileSync('./current_data/weather_forecast.json')
        data = JSON.parse(data)

        let relevantData = [
            // day 1
            {
                date: data.list[0].dt,
                min: Math.round(data.list[0].temp.min),
                max: Math.round(data.list[0].temp.max),
                icon: data.list[0].weather[0].icon,
                description: data.list[0].weather[0].description,
            },
            // day 2
            {
                date: data.list[1].dt,
                min: Math.round(data.list[1].temp.min),
                max: Math.round(data.list[1].temp.max),
                icon: data.list[1].weather[0].icon,
                description: data.list[0].weather[0].description,
            },
            // day 3
            {
                date: data.list[2].dt,
                min: Math.round(data.list[2].temp.min),
                max: Math.round(data.list[2].temp.max),
                icon: data.list[2].weather[0].icon,
                description: data.list[0].weather[0].description,
            },
            // day 4
            {
                date: data.list[3].dt,
                min: Math.round(data.list[3].temp.min),
                max: Math.round(data.list[3].temp.max),
                icon: data.list[3].weather[0].icon,
                description: data.list[0].weather[0].description,
            },
            // day 5
            {
                date: data.list[4].dt,
                min: Math.round(data.list[4].temp.min),
                max: Math.round(data.list[4].temp.max),
                icon: data.list[4].weather[0].icon,
                description: data.list[0].weather[0].description,
            }
        ]

        socket.emit('weather_forecast', relevantData)
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    getCurrentWeatherData,
    sendStoredCurrentWeather,
    getWeatherForecastData,
    sendStoredWeatherForecast
}
