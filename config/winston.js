const path      = require('path');
const winston   = require('winston');

const options = {
    file: {
        // 0: error, 1: warn, 2: info, 3: verbose, 4: debug, 5: silly
        // If choose a level anything at that level up to level error (most important) will be logged
        level: 'info',
        // Where to log the messages
        filename: __dirname + '/../logs/app.log',
        // Exceptions will go through here
        handleExceptions: true,
        // Output in JSON?
        json: true,
        // 5MB file then make another one
        maxsize: 5242880,
        // Add color for visual cues
        colorize: true,
    },

    console: {
        // Still want to log into console, especially when dev (but not an issue for prod too in Heroku console
        // Using a lower level of logging here, so more is logged in console
        // Next options, same concept as above
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};


// Using these options, we instantiate a logger
let logger = winston.createLogger({
    transports: [
        // Use options above
        // A transport is a channel and we use the to File and to Console
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
  ],
  // Do not exit if exception handled (unhandled exceptions cause nodejs to stop the app anyway)
    exitOnError: false
});


// Morgan is another logging pkg that will log all http route accesses in our app
// It can be provided a stream and we give it the winston logger ABOVE with a write strem so that
// it logs in console and file like winston does and they both write same places
// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding) {
        // Make the message from Morgan be at the level of 
        logger.info(message);
    },
};

// We app.use() both winston and morgan in app.js
// Basically making them middleware for logging procedures

module.exports = logger;
