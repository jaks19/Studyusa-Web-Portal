// Packages
var express = require("express"),
    passport = require("passport"),
    mkdirp = require('mkdirp'),
    request = require('request'),
    path = require('path'),
    format = require('../notifJson');

// Services
let userServices = require('../services/user-services'),
    authServices = require('../services/auth-services');


// Models
var User = require("../models/user");

// To be Exported
var router = express.Router({
    mergeParams: true
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

// Show Admin Dashboard
router.get('/admin', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.user.username;
    let adminData = await userServices.getUserData(username, req, res);
    res.render('./admin/dashboard', {
            user: adminData.populatedUser,
            users: adminData.users,
            client: adminData.populatedUser,
            notifs: adminData.allNotifs,
            unseenNotifs: adminData.unseenNotifs,
            format: format,
            firstContact: adminData.firstContact,
            loggedIn: true
    });
});

// Show User Dashboard
router.get('/:username', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.params.username;
    let userData = await userServices.getUserData(username, req, res);
    res.render('show', {
            user: userData.populatedUser,
            client: userData.populatedUser,
            notifs: userData.allNotifs,
            unseenNotifs: userData.unseenNotifs,
            format: format,
            firstContact: userData.firstContact,
            subs: userData.subs,
            articles: userData.articles,
            loggedIn: true
    });
});

// Delete User - DELETE (admin-only access)
router.delete('/:username', authServices.confirmUserCredentials, function(req, res) {
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
