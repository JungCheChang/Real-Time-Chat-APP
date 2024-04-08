var moment = require('moment-timezone');

function formatMessage(username, text){
    return{
        username,
        text,
        time: moment().tz("America/Los_Angeles").format('h:mm a')
    }
}

module.exports = formatMessage;