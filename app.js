require("babel-polyfill")

// Require
var
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    express        = require("express"),
    app            = express(),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    User           = require("./models/user"),
    flash          = require('connect-flash'),
    methodOverride = require("method-override"),
    path           = require('path');
    // path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
    // Returns: '/foo/bar/baz/asdf'


// App Config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true})); // To parse the body of a request
app.use(methodOverride('_method'));


// These allow referring to files in front-end
// app.use('/tingle', express.static(path.join(__dirname, '/node_modules/tingle.js/dist/')));
// For example allows front-end code to just say /tingle/filename and it actually finds filename in '/node_modules/tingle.js/dist/'
app.use('/tingle', express.static(__dirname + '/node_modules/tingle.js/dist/'));
app.use('/scripts', express.static(__dirname + '/scripts/'));
app.use('/styles', express.static(__dirname + '/styles/'));
app.use('/images', express.static(__dirname + '/images/'));


mongoose.connect(process.env.dbUrl, {
    useMongoClient: true, // because mongoose openUri() deprecated
    autoReconnect: true, // reconnect if lose connection
    reconnectTries: Number.MAX_VALUE, // try reconnecting infinitely
    bufferMaxEntries: 0 // clear old broken connections

});

// ES6 promises, since mongoose promises deprecated
mongoose.Promise = global.Promise;


// Passport Config (For Authentication)
app.use(require("express-session")({
    secret: "xyz",
    resave: false,
    saveUninitialized: false
}));


// More App Config
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());    // Session tracking (Passport sees if user still online)
passport.use(new LocalStrategy(User.authenticate())); //Strategy on how to authenticate. Provided in library passport-local-mongoose
passport.serializeUser(User.serializeUser()); // Provide Hash/unhash method (already written in passport-local-mongoose)
passport.deserializeUser(User.deserializeUser()); // Method for reverse of above (same lib: passport-local-mongoose)
// Right now req.user has a user with nothing populated, if wanted could change deserialize to populate when doing so (left for now, see tasks routes for viewng tasks as a user for e.g.)

app.use(function(req, res, next){
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Restful Routes
var
    authRoutes              = require('./routes/auth'),
    userRoutes              = require('./routes/users'),
    taskCommentsRoutes      = require('./routes/taskComments'),
    taskResponsesRoutes   = require('./routes/taskResponses'),
    // paymentRoutes           = require('./routes/payments'),
    messageRoutes           = require('./routes/messages'),
    groupRoutes             = require('./routes/groups'),
    notifRoutes             = require('./routes/notifs'),
    invitationRoutes        = require('./routes/invitations'),
    taskRoutes              = require('./routes/tasks');
    // addsRoutes              = require('./routes/adds'),
    // submissionRoutes        = require('./routes/submissions'),
    // amazons3Routes          = require('./routes/amazons3');

app.use(authRoutes),
app.use('/index', userRoutes),
app.use('/index/:username/tasks/:taskId/comments', taskCommentsRoutes),
app.use('/index/:username/tasks/:taskId/responses', taskResponsesRoutes),
// app.use('/index/:username/submit/:id/adds', addsRoutes);
// app.use('/index/:username/submit/:id/s3/:subTitle', amazons3Routes);
// app.use('/index/:username/submit', submissionRoutes);
// app.use('/index/:username/pay', paymentRoutes),
app.use('/index/:username/messages', messageRoutes),
app.use('/index/:username/groups', groupRoutes),
app.use('/index/:username/notifs', notifRoutes),
app.use('/index/:username/invitations', invitationRoutes),
app.use('/index/:username/tasks', taskRoutes);

// Wandering Routes
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
