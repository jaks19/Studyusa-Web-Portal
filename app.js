require("babel-polyfill")

// Note: Every use of app.use(X) is basically adding middleware X to the middleware stack along the flow to routes
// This is an express app to routes are watched by express and these middleware act before the route responses
const express = require("express");
const app     = express();


// Views are going to end by ejs so no need to specify '.ejs' each time
app.set('view engine', 'ejs');


// These allow referring to files in front-end
// app.use('/tingle', express.static(path.join(__dirname, '/node_modules/tingle.js/dist/')));
// For example allows front-end code to just say /tingle/filename and it actually finds filename in '/node_modules/tingle.js/dist/'
//
// We use Path for easy path construction
// Returns: '/foo/bar/baz/asdf'
// path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
const path = require('path');
app.use('/tingle', express.static(__dirname + '/node_modules/tingle.js/dist/'));
app.use('/scripts', express.static(__dirname + '/scripts/'));
app.use('/public', express.static(__dirname + '/public/'));


// Connect to database
const mongoose = require("mongoose");
mongoose.connect(process.env.dbUrl, {
    useMongoClient: true, // because mongoose openUri() deprecated
    autoReconnect: true, // reconnect if lose connection
    reconnectTries: Number.MAX_VALUE, // try reconnecting infinitely
    bufferMaxEntries: 0 // clear old broken connections
});

// ES6 promises, since mongoose promises deprecated
mongoose.Promise = global.Promise;


// Passport Config (For Authentication)
const passport       = require("passport");
const LocalStrategy  = require("passport-local");
const User           = require("./models/user");

app.use(require("express-session")({
    secret: "xyz",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());    // Session tracking (Passport sees if user still online)
passport.use(new LocalStrategy(User.authenticate())); //Strategy on how to authenticate. Provided in library passport-local-mongoose
passport.serializeUser(User.serializeUser()); // Provide Hash/unhash method (already written in passport-local-mongoose)
passport.deserializeUser(User.deserializeUser()); // Method for reverse of above (same lib: passport-local-mongoose)
// Right now req.user has a user with nothing populated, if wanted could change deserialize to populate when doing so (left for now, see tasks routes for viewng tasks as a user for e.g.)


// Error-Logging

// Printing errors to screen in flash cards (req.flash())
const flash = require('connect-flash');
app.use(flash());

// // Logging of HTTP routing history
// const morgan = require('morgan');
// const winston = require('./config/winston');
// // 'combined' is just the format of the logging
// app.use(morgan('combined', { stream: winston.stream }));

app.use(function(req, res, next){
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});


// Parsing body of requests for forms etc
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : true})); // To parse the body of a request


// Routes

// Allows PUT, DELETE etc in routes when not supported by client (?_method=PUT etc)
const methodOverride  = require("method-override");
app.use(methodOverride('_method'));

// All the routes go here in logical order
const authRoutes              = require('./routes/auth');
const userRoutes              = require('./routes/users');
const taskCommentsRoutes      = require('./routes/taskComments');
// const taskResponsesRoutes     = require('./routes/taskResponses');
// const paymentRoutes           = require('./routes/payments');
const messageRoutes           = require('./routes/messages');
const groupRoutes             = require('./routes/groups');
const notifRoutes             = require('./routes/notifs');
const invitationRoutes        = require('./routes/invitations');
const taskRoutes              = require('./routes/tasks');
// const addsRoutes              = require('./routes/adds');
// const submissionRoutes        = require('./routes/submissions');
// const amazons3Routes          = require('./routes/amazons3');

app.use(authRoutes),
app.use('/index', userRoutes),
app.use('/index/:username/tasks/:taskId/comments', taskCommentsRoutes),
// app.use('/index/:username/tasks/:taskId/responses', taskResponsesRoutes),
// app.use('/index/:username/submit/:id/adds', addsRoutes);
// app.use('/index/:username/submit/:id/s3/:subTitle', amazons3Routes);
// app.use('/index/:username/submit', submissionRoutes);
// app.use('/index/:username/pay', paymentRoutes),
app.use('/index/:username/messages', messageRoutes),
app.use('/index/:username/groups', groupRoutes),
app.use('/index/:username/notifs', notifRoutes),
app.use('/index/:username/invitations', invitationRoutes),
app.use('/index/:username/tasks', taskRoutes);


// Catch Wandering Routes
app.get('/*', function(req, res){
    res.render('index', {loggedIn: false});
});

// Index
app.get('/', function(req, res) {
    res.render('index', {loggedIn: false});
});

// Server On
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Portal Activated!");
});
