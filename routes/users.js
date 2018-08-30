// Packages
let express = require("express"),
    path = require('path'),
    format = require('../text/notifJson');

// Services
let userServices = require('../services/user-services'),
    authServices = require('../services/auth-services'),
    invitationServices = require('../services/invitation-services'),
    dbopsServices = require('../services/dbops-services');

// Models
let User = require("../models/user");

// Note: turn on if need an admin next
let makeAdmin = false;

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
        req.flash('error', 'The token you entered is either invalid or expired. Please contact your counselor for a new one.');
        res.redirect('back');
        return;
     }

    try { await userServices.registerUser(makeAdmin, req) }
    catch(error) {
        req.flash('error', error.message);
        res.redirect('back');
        return;
    }

    res.redirect('/');
});


// User Dashboard (regular or admin)
router.get('/:username', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.params.username,
        userData = await userServices.getUserData(username, req, res);

    if (userData.populatedUser.admin){
        res.render('./admin/dashboard', {
            user: req.user,
            users: userData.users,
            client: userData.populatedUser,
            notifs: userData.allNotifs,
            unseenNotifs: userData.unseenNotifs,
            format: format,
            activeInvitations: userData.activeInvitations,
            expiredInvitations: userData.expiredInvitations,
            context: userData.context,
            loggedIn: true,
            groupId: -1
        });
    } else {
        res.render('show', {
            user: req.user,
            client: userData.populatedUser,
            notifs: userData.allNotifs,
            unseenNotifs: userData.unseenNotifs,
            format: format,
            tasks: userData.tasks,
            articles: userData.articles,
            context: userData.context,
            loggedIn: true
        });
    }
});

// Delete
router.delete('/:username', async function(req, res) {
    let username = req.params.username,
        userData = await userServices.getUserData(username, req, res);

    await dbopsServices.findEntryByIdAndRemove(User, userData.populatedUser._id);
    res.redirect('back');
});

module.exports = router;
