const request = require('request');
const fs = require('fs');

function getRemindersData(url, socket = null) {
    request(url, { json: true }, (err, res, body) => {
        if (err) { console.log(err); }

        // broadcast
        broadcastRemindersData(body);

        // Save current api call to file
        try {
            fs.writeFileSync('./current_data/reminders_data.json', JSON.stringify(body))
        } catch (err) {
            console.error(err);
        }
    });
}

function broadcastRemindersData(data, socket = null) {
    if (socket == null) {
        io.sockets.emit('reminders_data', data);
        console.log("[" + new Date().toISOString() + "] " + "Broadcast reminders data");
    } else {
        socket.emit('reminders_data', data);
        console.log("[" + new Date().toISOString() + "] " + "Sent reminders data to " + socket.handshake.address);
    }
}

function sendStoredRemindersData(socket) {
    // Read weather data from file
    try {
        let data = fs.readFileSync('./current_data/reminders_data.json');
        data = JSON.parse(data);
        socket.emit('reminders_data', data);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getRemindersData,
    sendStoredRemindersData
};
