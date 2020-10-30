/*
* This is the example config file. Here you can find anything that is customizable and change it to your liking.
* Best practise for you would be to copy this file, make your changes there and rename this one.
*
* This json structure is sorted ALPHABETICALLY.
* */

module.exports = {
    calendar: {
        url: "https://p29-caldav.icloud.com/published/2/AAAAAAAAAAAAAAAAAAAAAFSz-ZZUaEzWa8Ce2h91Ewcomfqh8rO1Bxwf9dQiPc-NMRHs50zpQnUbW-bqoHyaJi0iK08WGF018iy8RxPNF9c"
    },

    public_transport: {
        stationID: 900000100011,   // Stadtmitte
        results: 10
    },

    reminders: {
        url: "http://localhost:3000/reminders_data_example.json"
    },

    weather: {
        apiKey: "",      // TODO: INSERT YOUR API KEY HERE (more information: https://openweathermap.org/appid)
        cityID: 2950157, // cityID can be found here: http://bulk.openweathermap.org/sample/ -> File: city.list.json.gz
        lang: "de",
        unit: "metric"
    }
}