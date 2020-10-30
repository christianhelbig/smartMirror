const request = require('request')
const fs = require('fs')

/**
 * Since it is not easy to retrieve data from the iOS Reminders app, I came up with a (not ideal) workaround.
 * I'm using IFTTT to send a post request from my iPhone to a little program that is running on a web server, whenever
 * I create, complete or delete an item, it stores/deletes the item in a json file.
 * This module retrieves the data from the webserver.
 *
 * The json looks like this:
 * {
 *  "data": [
 *    {
 *      "title": "This is a boring chore",
 *      "date_created": "March 31, 2020 at 11:08AM",
 *      "priority": "None"
 *    }
 *  ]
 * }
 *
 * TODO: Connect directly to iCloud and retrieve data
 *
 * @param url
 * @param socket
 */

function getRemindersData(url, socket = null) {
    request(url, { json: true }, (err, res, body) => {
        if (err) { console.log(err) }

        // Broadcast
        broadcastRemindersData(body)

        // Save current response to file
        try {
            fs.writeFileSync('./current_data/reminders_data.json', JSON.stringify(body))
        } catch (err) {
            console.error(err)
        }
    })
}

function broadcastRemindersData(data, socket = null) {
    if (socket == null) {
        // Broadcast new retrieved data
        io.sockets.emit('reminders_data', data)
        console.log("[" + new Date().toISOString() + "] " + "Broadcast reminders data")
    } else {
        // Broadcast stored data to newly connected participant
        socket.emit('reminders_data', data)
        console.log("[" + new Date().toISOString() + "] " + "Sent reminders data to " + socket.handshake.address)
    }
}

function sendStoredRemindersData(socket) {
    // Read reminders data from file
    try {
        let data = fs.readFileSync('./current_data/reminders_data.json')
        data = JSON.parse(data)
        socket.emit('reminders_data', data)
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    getRemindersData,
    sendStoredRemindersData
}
