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
    apiServices = require('../services/api-services'),
    authServices = require('../services/auth-services');


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

// Show User
router.get('/:username', middleware.isLoggedIn, async function(req, res) {
    let username = req.params.username;
    let loggedIn = authServices.confirmCredentials(username, req, res);
    if (!loggedIn) {return};
    
    let foundUser = userServices.findUser(username);
    let populatedUser = await dbOpsServices.populateEntry(foundUser, ['submissions', 'notifs'], req, res);
    let allNotifs = populatedUser.notifs.reverse();
    let unseenNotifs = notifServices.getUnseenNotifs(populatedUser.notifs);
    let firstContact = req.query.welcome ? true : false;
    
    if (populatedUser.admin) {
        let users = await userServices.findAllUsers();
        userServices.renderAdminDashboard(res, users, loggedIn, populatedUser, allNotifs, unseenNotifs, format, firstContact);
    } else {
        let articles = await apiServices.retrieveNews(req);
        let subs = populatedUser.submissions.reverse();
        userServices.renderUserDashboard(res, subs, articles, loggedIn, populatedUser, allNotifs, unseenNotifs, format, firstContact);
    }
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
