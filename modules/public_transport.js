const request = require('request');

function getTransportData(stationID, results) {
    request('https://v5.bvg.transport.rest/stops/' + stationID + '/departures?results=' + results + '&duration=1440', { json: true }, (err, res, body) => {
        if (err) { console.log(err); }

        // cleanup of data
        try {
            body = purifyDepartureData(body)
        } catch (e) {
            console.log(e);
            console.log(body);
            return;
        }

        // add time stamp to data
        body.timestamp = Date.now();

        // broadcast
        broadcastTransportData(body);
    });
}

function purifyDepartureData(data) {
    // get time for later calculation
    let timeNow = Date.now();

    let cleanData = {
        stationName: data[0].stop.name,
        data: []
    };

    for (let i = 0; i < data.length; i++) {
        let element = {
            mode: data[i].line.product,
            lineID: data[i].line.id,
            lineName: data[i].line.name,
            direction: data[i].direction,
            departure: data[i].when,
            departsIn: ''
        }

        // calculate departs in
        let timeDiff = Math.abs(new Date(data[i].when) - new Date(timeNow)); // in milliseconds
        element.departsIn = Math.floor((timeDiff / 1000) / 60);

        cleanData.data.push(element);
    }

    function sortByDeparture(a, b) {
        return ((a.departsIn < b.departsIn) ? -1 : ((a.departsIn > b.departsIn) ? 1 : 0));
    }

    cleanData.data.sort(sortByDeparture)

    return cleanData;
}

function broadcastTransportData(data) {
    // sends public transport data to all sockets
    io.sockets.emit('current_departures', data);
    console.log("[" + new Date().toISOString() + "] " + "Broadcast departures");
}

module.exports = {
    getTransportData
};
