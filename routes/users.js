// Packages
var express = require("express"),
    passport = require("passport"),
    mkdirp = require('mkdirp'),
    request = require('request'),
    path = require('path'),
    format = require('../notifJson');

// Services
let userServices = require('../services/user-services'),
    authServices = require('../services/auth-services'),
    filesystemServices = require('../services/filesystem-services');


// Models
var User = require("../models/user");

var router = express.Router({
    mergeParams: true
});

// New User Page
router.get('/new', function(req, res) {
    res.render('new', {
        loggedIn: false
    });
});

// New User Signup
router.post('/', async function(req, res) {
    var newUserObject = new User({ name: req.body.name, username: req.body.username });
    User.register(newUserObject, req.body.password, function(){return});
    await filesystemServices.createUserFolder(req.body.username, req, res);
    res.redirect('/login');
});

// Admin Dashboard
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

// User Dashboard
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

// Delete
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