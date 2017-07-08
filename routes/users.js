// Packages
var express = require("express"),
    passport = require("passport"),
    middleware = require('../middleware'),
    mkdirp = require('mkdirp'),
    request = require('request'),
    path = require('path'),
    format = require('../notifJson');

// Services
var userServices = require('../services/user-services'),
    notifServices = require('../services/notif-services'),
    dbOpsServices = require('../services/dbops-services'),
    apiServices = require('../services/api-services');


// Models
var User = require("../models/user");

// To be Exported
var router = express.Router(); // To allow linking routing from this file to app (For cleaner code)

// Index
router.get('/', function(req, res) {
    res.render('index', {
        loggedIn: false
    });
});

// New User - GET
router.get('/new', function(req, res) {
    // Takes a user who clicked on 'sign up' to the form
    res.render('new', {
        loggedIn: false
    });
});

// New User - POST
router.post('/', function(req, res) {
    // Traditionally use 'create'. Here need to auth and passport format is always as follows:
    // Register user with params separated as: whole user minus password, then the password
    var newUser = new User({
        name: req.body.name,
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(error, user) {
        if (error) {
            req.flash('error', error);
            res.redirect('back');
        }
        else {
            passport.authenticate("local")(req, res, function() {
                mkdirp(path.resolve(".") + '/uploads/' + req.body.username, function(err) {
                    if (err) {
                        req.flash('error', 'Could not create a personal uploads folder!');
                        res.redirect('back');
                    }
                });
                res.redirect('/login');
            });
        }
    });
});

// Show User (First Contact)
router.get('/:username/welcome', middleware.isLoggedIn, async function(req, res) {
    let username = req.params.username;
    let foundUser = userServices.findUser(username);
    let populatedUser = await dbOpsServices.populateEntry(foundUser, ['submissions', 'notifs'], req, res);
    let allNotifs = populatedUser.notifs.reverse();
    let unseenNotifs = notifServices.getUnseenNotifs(populatedUser.notifs);
    
    // FOUNDuser
    if (populatedUser.admin) {
        let users = await userServices.findAllUsers();
        res.render('./admin/dashboard', {
            loggedIn: true,
            users: users,
            user: populatedUser,
            client: populatedUser,
            viewer: req.user,
            format: format,
            notifs: allNotifs,
            unseenNotifs: unseenNotifs,
            firstContact: true
        });
    } else {
        let articles = await apiServices.retrieveNews(req);
        res.render('show', {
            format: format,
            loggedIn: true,
            user: populatedUser,
            client: populatedUser,
            notifs: allNotifs,
            unseenNotifs: unseenNotifs,
            subs: populatedUser.submissions.reverse(),
            articles: articles,
            viewer: req.user,
            firstContact: true
        });
    }
});

// Show User (Rest of the time)
router.get('/:username', middleware.isLoggedIn, function(req, res) {
    var username = req.params.username;
    var unseenNotifs;
    User.findOne({
        'username': username
    }).populate('submissions').populate('notifs').exec(function(err, foundUser) {
        if (err) {
            req.flash('error', 'Could not retrieve your user record!');
            res.redirect('back');
        }
        else {
            // Create a list of only UNSEEN notifications
            var allNotifs = foundUser.notifs;
            var atleastOneUnseen = false;
            allNotifs.slice(0).forEach(function(notif){
                if (!notif.seen){
                    if (!atleastOneUnseen){
                        unseenNotifs = [];
                    }
                    unseenNotifs.push(notif);
                    atleastOneUnseen = true;
                }
            });
            if (!atleastOneUnseen){
                unseenNotifs = 'nothingUnseen'
            } else {
                unseenNotifs.reverse();
            }

            // FOUNDuser
            if (foundUser.admin) {
                User.find({}, function(error, users) {
                    if (error) {
                        req.flash('error', 'Could not retrieve and present all users on this screen!');
                        res.redirect('back');
                    }
                    else {
                        res.render('./admin/dashboard', {
                            loggedIn: true,
                            users: users,
                            user: foundUser,
                            format: format,
                            notifs: allNotifs.reverse(),
                            unseenNotifs: unseenNotifs,
                            firstContact: false,
                            client: foundUser,
                            viewer: req.user,
                        });
                    }
                });
            } else {
                // Can be ADMIN wishing to see client's dashboard
                //Request News API
                request('https://newsapi.org/v1/articles?source=cnn&sortBy=top&apiKey=c8e7fde98b5a4983b913761b2e7db0f6',
                    function(error, response, body){
                        if (error){
                            req.flash('error', 'Could not fetch live news :(');
                        } else {
                            if (response.statusCode == 200){

                                var parsedData = JSON.parse(body);
                                var articles = parsedData['articles'].splice(0,10);
                                res.render('show', {
                                    format: format,
                                    loggedIn: true,
                                    user: foundUser,
                                    client: foundUser,
                                    notifs: allNotifs.reverse(),
                                    unseenNotifs: unseenNotifs,
                                    subs: foundUser.submissions.reverse(),
                                    articles: articles,
                                    viewer: req.user,
                                    firstContact: false
                                });
                        }
                    }
                });
                // End of API Request
            }
        }
    });
});

// Delete User - DELETE (admin-only access)
router.delete('/:username', middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    User.findOneAndRemove({'username' : req.params.username}, function(error){
        if (error){
            req.flash('error', 'The user account could not be deleted!');
            return res.redirect('back');
        } else {
            req.flash('success', 'The user account was successfully deleted! Ciao to the user! ;)');
            return res.redirect('/index/' + req.user.username);
        }
    });
});

module.exports = router;
