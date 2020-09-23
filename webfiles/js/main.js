var socket = io();

// Global variables
var monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
var weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

timeAndDate();
initCalendar();

// Getting current weather information
socket.on('current_weather', function(data) {
    jQuery(".current-weather .weather-location").each(function(){ this.innerText = data.name; });
    jQuery(".current-weather .weather-description").each(function(){ this.innerText = data.description; });
    jQuery(".current-weather .weather-icon").each(function(){
        let string = jQuery(this).attr('src');
        // replace icon name in src url using regex
        string = string.replace(/\/[0-9][0-9][d,n]./g, "/" + data.icon + ".");
        jQuery(this).attr('src', string);
    });
    jQuery(".current-weather .current-temp .temp").each(function(){ this.innerText = data.temp; });

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Min Max temperature is being updated within the forecast function * //
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

    jQuery(".current-weather .sunrise .data").each(function(){
        let date = new Date(data.sunrise * 1000);
        let hour;
        let minute;

        if (date.getHours() < 10) hour = "0" + date.getHours();
        else hour = date.getHours();

        if (date.getMinutes() < 10) minute = "0" + date.getMinutes();
        else minute = date.getMinutes();

        this.innerText = hour + ":" + minute;
    });
    jQuery(".current-weather .sunset .data").each(function(){
        let date = new Date(data.sunset * 1000);
        let hour;
        let minute;

        if (date.getHours() < 10) hour = "0" + date.getHours();
        else hour = date.getHours();

        if (date.getMinutes() < 10) minute = "0" + date.getMinutes();
        else minute = date.getMinutes();

        this.innerText = hour + ":" + minute;
    });
});

// Get forecast for next 4 days
socket.on('weather_forecast', function(data) {
    // display min max temperature of whole day in current weather panel
    jQuery(".current-weather .minmax-temp .min").each(function(){ this.innerText = data[0].min; });
    jQuery(".current-weather .minmax-temp .max").each(function(){ this.innerText = data[0].max; });

    jQuery(".weather-forecast").each(function(){
        let forecastElements = jQuery(this).find(".forecast-element");

        for (let i = 0; i < forecastElements.length; i++) {
            let currentElement = jQuery(forecastElements[i]);

            let date = new Date(data[i].date * 1000);
            let weekday = weekdays[date.getDay()];

            // weekday
            jQuery(currentElement).find(".weekday").get(0).innerText = weekday;

            // icon
            let iconElement = jQuery(currentElement).find(".weather-icon").get(0);
            let string = jQuery(iconElement).attr('src');
            // replace icon name in src url using regex
            string = string.replace(/\/[0-9][0-9][d,n]./g, "/" + data[i].icon + ".");
            jQuery(iconElement).attr('src', string);

            // min max temperature
            jQuery(currentElement).find(".minmax-temp .min").get(0).innerText = data[i].min;
            jQuery(currentElement).find(".minmax-temp .max").get(0).innerText = data[i].max;
        }
    })
});

socket.on('calendar_data', function(data) {
    let calendarDays = jQuery('.calendar .elements .col-cal-7');
    let calendarHeaderDays = jQuery('.calendar .header .col-cal-7 .day');

    clearCalendar(jQuery('.calendar').get(0));

    for (let i = 0; i < data.length; i++) {
        // find position where to append event BY DAY
        let day = new Date(data[i].start).getDate();
        let pos = jQuery(calendarHeaderDays).index(jQuery(calendarHeaderDays).filter('[data-day="' + day + '"]'));

        if(data[i].allday) {
            jQuery(calendarDays[pos]).append(
                '<div class="cal-event">' +
                '<div class="name">' + data[i].summary + '</div>' +
                '</div>'
            )
        } else {
            let startHour = new Date(data[i].start).getHours();
            let startMinute = new Date(data[i].start).getMinutes();
            let endHour = new Date(data[i].end).getHours();
            let endMinute = new Date(data[i].end).getMinutes();

            if (startHour < 10) startHour = '0' + startHour;
            if (startMinute < 10) startMinute = '0' + startMinute;
            if (endHour < 10) endHour = '0' + endHour;
            if (endMinute < 10) endMinute = '0' + endMinute;

            jQuery(calendarDays[pos]).append(
                '<div class="cal-event">' +
                '<div class="time">' +
                startHour + ':' + startMinute + ' - '
                + endHour + ':' + endMinute
                + '</div>' +
                '<div class="name">' + data[i].summary + '</div>' +
                '</div>'
            )
        }
    }
});

socket.on('reminders_data', function(data) {
    let todo = jQuery('.tasks ul').eq(0);

    // remove all old reminders
    jQuery(todo).empty();

    // create task elements
    // <li class="task">Test Task</li>
    for(let i = 0; i < data.data.length; i++) {
        jQuery(todo).append('<li class="task">' + data.data[i].title + '</li>')
    }
});

socket.on('sensor_data', function(data) {
    jQuery('.room-temp .temp').each(function(){ this.innerText = data[0].temp; });
});

socket.on('current_departures', function(data) {
    console.log(data);
    // add name
    jQuery('.public-transport #stop').text(data.stationName);

    // delete old entries
    let lines = jQuery('.public-transport #departures .lines').empty();
    let directions = jQuery('.public-transport #departures .directions').empty();
    let times = jQuery('.public-transport #departures .departureTimes').empty();

    // add data
    for (let i = 0; i < data.data.length; i++) {
        // line name
        jQuery(lines).append('<div class="line ' + data.data[i].lineID + ' ' + data.data[i].mode + '">' + data.data[i].lineName + '</div>')
        // direction
        if (data.data[i].departsIn === 0) {
            jQuery(directions).append('<div class="direction blink">' + data.data[i].direction + '</div>')
        } else {
            jQuery(directions).append('<div class="direction">' + data.data[i].direction + '</div>')
        }
        // departure
        if (data.data[i].departsIn === 0) {
            jQuery(times).append('<div class="departureTime">&nbsp;</div>')
        } else {
            jQuery(times).append('<div class="departureTime">' + data.data[i].departsIn + ' min</div>')
        }
    }
});

function clearCalendar(calendar) {
    jQuery(calendar).find('.cal-event').each(function(){
        jQuery(this).remove();
    })
}

function initCalendar() {
    let calendar = jQuery('.calendar').get(0);

    clearCalendar(calendar);

    // adding weekdays - multilanguage support planned
    let calendarDaynameLabels = jQuery(calendar).find('.dayname');
    for (let i = 1; i < 8; i++) {
        if (i < 7) jQuery(calendarDaynameLabels).get(i - 1).innerText = weekdays[i];
        else jQuery(calendarDaynameLabels).get(i-1).innerText = weekdays[0];
    }

    // adding days
    let calendarDays = jQuery(calendar).find('.day');

    let counter = (new Date()).getDay() - 1;
    for (let i = 0; i < 7; i++) {
        if (counter === 7) counter = 0;

        jQuery(calendarDays).get(counter).innerText = new Date((new Date()).getTime() + (86400000 * i)).getDate();
        jQuery(calendarDays).eq(counter).attr('data-day', new Date((new Date()).getTime() + (86400000 * i)).getDate());

        counter++;
    }

    // mark todays date
    // -- remove old active status
    jQuery(calendar).find('.header .col-cal-7').each(function(){
        jQuery(this).removeClass('active');
    });
    jQuery(calendar).find('.elements .col-cal-7').each(function(){
        jQuery(this).removeClass('active');
    });

    // -- set new active status
    let today_head = jQuery(calendar).find('.header .col-cal-7').get((new Date()).getDay() - 1);
    let today_el = jQuery(calendar).find('.elements .col-cal-7').get((new Date()).getDay() - 1);
    jQuery(today_head).addClass('active');
    jQuery(today_el).addClass('active');

    // this sets height to same value as width
    jQuery(today_head).find('.day').eq(0).css('width', jQuery(today_head).find('.day').innerHeight());
}


function timeAndDate() {
    var d = new Date();

    var update = setInterval(function(){
        d = new Date();

        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();

        var weekday = d.getDay();
        var day = d.getDate();
        var month = d.getMonth();
        var year = d.getFullYear();

        jQuery(".time .hour").each(function(){ this.innerText = hour; });
        jQuery(".time .minute").each(function(){
            if (minute < 10) {
                this.innerText = "0" + minute;
            } else {
                this.innerText = minute;
            }
        });
        jQuery(".time .second").each(function(){
            if (second < 10) {
                this.innerText = "0" + second;
            } else {
                this.innerText = second;
            }
        });

        jQuery(".date .dayname").each(function(){ this.innerText = weekdays[weekday]; });
        jQuery(".date .day").each(function(){ this.innerText = day; });
        jQuery(".date .monthname").each(function(){ this.innerText = monthNames[month]; });
        jQuery(".date .year").each(function(){ this.innerText = year; });

        // update calendar dates at midnight
        if (hour === 0 && minute === 0 && second === 0) {
            initCalendar();
            socket.emit('calendar_data');
        }
    }, 1000)
}
