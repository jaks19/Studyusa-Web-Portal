// Packages
let express = require("express"),
    path = require('path'),
    format = require('../notifJson');

// Services
let userServices = require('../services/user-services'),
    authServices = require('../services/auth-services'),
    invitationServices = require('../services/invitation-services'),
    filesystemServices = require('../services/filesystem-services');

// Models
let User = require("../models/user");
// Note: turn on if need an admin next
let make_admin = true;

let router = express.Router({ mergeParams: true });

// New User Page
router.get('/new', function(req, res) {
    res.render('new', {
        loggedIn: false
    });
});

// New User Signup
router.post('/', async function(req, res) {
    let tokenValidity = await invitationServices.isValid(req, res, true);
    if (!tokenValidity) {
        req.flash('error', 'The token you entered is either invalid or expired. Please contact your counselor for a new one.')
        res.redirect('back');
        return;
    }
    var newUserObject;
    if (make_admin){ newUserObject = new User({ name: req.body.name, username: req.body.username, admin: true });
    } else { newUserObject = new User({ name: req.body.name, username: req.body.username}); }

    User.register(newUserObject, req.body.password, function(){return});
    res.redirect('/login');
});


// User Dashboard (regular or admin)
router.get('/:username', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.params.username,
        userData = await userServices.getUserData(username, req, res);


    if (userData.populatedUser.admin){
        res.render('./admin/dashboard', {
            user: userData.populatedUser,
            users: userData.users,
            client: userData.populatedUser,
            notifs: userData.allNotifs,
            unseenNotifs: userData.unseenNotifs,
            format: format,
            activeInvitations: userData.activeInvitations,
            expiredInvitations: userData.expiredInvitations,
            context: userData.context,
            loggedIn: true
        });
    } else {
        res.render('show', {
            user: req.user,
            client: userData.populatedUser,
            notifs: userData.allNotifs,
            unseenNotifs: userData.unseenNotifs,
            format: format,
            subs: userData.subs,
            tasks: userData.tasks,
            articles: userData.articles,
            context: userData.context,
            loggedIn: true
        });
    }

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
