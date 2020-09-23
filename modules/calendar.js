const ical = require('ical');
const fs = require('fs');

function getCalendarData(url, socket = null) {
    ical.fromURL(url, {}, function(err, data) {
        if (err) {
            console.error(new Error(err));
            return;
        }

        try {
            let result = [];

            Object.keys(data).forEach(function(key) {
                let entry = data[key];

                // TODO Support events, that will be longer than one day
                // TODO yesterday still shown in next week
                if (entry.summary
                    // filter events older than 24hr (milliseconds)
                    && (entry.start > Date.now() - 86400000)
                    // filter events that are not within the next week
                    && (entry.start < Date.now() + 604800000)) {
                    // filter events that are later than one week, but still within the next 604800000 milliseconds
                    result.push({
                        summary: entry.summary,
                        allday: (entry.end - entry.start) % 86400000 === 0,
                        start: entry.start,
                        end: entry.end
                    });
                }
            });

            // sort object array by start date
            function sortByDate(a, b) {
                return new Date(a.start) - new Date(b.start);
            }

            result.sort(sortByDate);

            fs.writeFileSync('./current_data/calendar_data.json', JSON.stringify(result));

            if (socket == null) broadcastCalendarData(result);
            else broadcastCalendarData(result, socket);
        } catch (err) {
            console.error(err);
        }
    });
}

function broadcastCalendarData(data, socket = null) {
    if (socket == null) {
        io.sockets.emit('calendar_data', data);
        console.log("[" + new Date().toISOString() + "] " + "Broadcast calendar data");
    } else {
        socket.emit('calendar_data', data);
        console.log("[" + new Date().toISOString() + "] " + "Sent calendar data to " + socket.handshake.address);
    }
}

function sendStoredCalendarData(socket) {
    // Read weather data from file
    try {
        let data = fs.readFileSync('./current_data/calendar_data.json');
        data = JSON.parse(data);
        socket.emit('calendar_data', data);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getCalendarData,
    sendStoredCalendarData
};
