const ical = require('ical')
const fs = require('fs')

function getCalendarData(url, socket = null) {
    ical.fromURL(url, {}, function(err, data) {
        // Display error message on http error
        if (err) {
            console.error(new Error(err))
            return
        }

        try {
            let result = []

            // Filter events
            Object.keys(data).forEach(function(key) {
                let entry = data[key]

                // TODO Support events, that will be longer than one day
                // TODO yesterday still shown in next week
                if (entry.summary
                    // Filter events older than 24hr (milliseconds)
                    && (entry.start > Date.now() - 86400000)
                    // Filter events that are not within the next week
                    && (entry.start < Date.now() + 604800000)) {
                    result.push({
                        summary: entry.summary,
                        allday: (entry.end - entry.start) % 86400000 === 0,
                        start: entry.start,
                        end: entry.end
                    })
                }
            })

            // Sort object array by start date
            function sortByDate(a, b) {
                return new Date(a.start) - new Date(b.start)
            }

            result.sort(sortByDate)

            // Store data in local file - create folder if not exist
            if (!fs.existsSync('./current_data')) fs.mkdirSync('./current_data')

            fs.writeFileSync('./current_data/calendar_data.json', JSON.stringify(result))

            // Broadcast data
            if (socket == null) broadcastCalendarData(result)
            else broadcastCalendarData(result, socket)
        } catch (err) {
            console.error(err)
        }
    })
}

// Broadcast retrieved calendar data
function broadcastCalendarData(data, socket = null) {
    if (socket == null) {
        // Broadcast new retrieved data
        io.sockets.emit('calendar_data', data)
        console.log("[" + new Date().toISOString() + "] " + "Broadcast calendar data")
    } else {
        // Broadcast stored data to newly connected participant
        socket.emit('calendar_data', data)
        console.log("[" + new Date().toISOString() + "] " + "Sent calendar data to " + socket.handshake.address)
    }
}

// Read calendar data from file
function sendStoredCalendarData(socket) {
    let path = './current_data/calendar_data.json'

    try {
        let data = fs.readFileSync('./current_data/calendar_data.json')
        data = JSON.parse(data)
        socket.emit('calendar_data', data)
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    getCalendarData,
    sendStoredCalendarData
}
