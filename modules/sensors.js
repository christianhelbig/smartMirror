const fs = require('fs')

let data_filepath = './current_data/sensor_data.json'

// This function is triggered when new sensor readings come in and stores sensor readings in a file called
// sensor_data.json.
function receiveData(req, res) {
    let sensorData = []

    if (fs.existsSync(data_filepath)) {
        try {
            sensorData = JSON.parse(fs.readFileSync(data_filepath))
        } catch (err) {
            console.log(err)
            res.status(500).end()
        }
    }

    // Update value
    let found = false
    for (let i = 0;i < sensorData.length; i++) {
        if (sensorData[i].location == req.body.location) {
            found = true
            sensorData[i].temp = req.body.temp
            res.status(200).end()
        }
    }

    // If location not found in file, create new
    if (!found) {
        sensorData.push(req.body)
    }

    // Write file - create folder if not exist
    if (!fs.existsSync('./current_data')) fs.mkdirSync('./current_data')
    fs.writeFileSync(data_filepath, JSON.stringify(sensorData), function (err) {
        if (err) {
            res.status(500).end()
            console.log("[" + new Date().toISOString() + "] " + '[Sensor Data] An error occured while trying to write the file sensor_data.json: \n' + err)
        }
    })

    // Broadcast data
    broadcastSensorData(sensorData)

    res.status(200).end()
}

// Broadcast sensor data
function broadcastSensorData(data, socket = null) {
    // Broadcast new retrieved data to all
    if (socket == null) {
        io.sockets.emit('sensor_data', data)
        console.log("[" + new Date().toISOString() + "] " + "Broadcast sensor data")
    } else {
        // Broadcast stored data to newly connected participant
        socket.emit('sensor_data', data)
        console.log("[" + new Date().toISOString() + "] " + "Sent sensor data to " + socket.handshake.address)
    }
}

function sendStoredSensorData(socket) {
    // Read sensor data from file
    if (fs.existsSync(data_filepath)) {
        try {
            let data = fs.readFileSync(data_filepath)
            data = JSON.parse(data)
            socket.emit('sensor_data', data)
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = { receiveData, sendStoredSensorData }
