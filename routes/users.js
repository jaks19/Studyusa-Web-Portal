const express = require("express");
const path = require('path');
const format = require('../config/notifications-format');

const userServices = require('../services/user-services');
const authServices = require('../services/auth-services');
const invitationServices = require('../services/invitation-services');
const dbopsServices = require('../services/dbops-services');

const User = require("../models/user");

// Note: turn on if need an admin next
const makeAdmin = false;


let router = express.Router({ mergeParams: true });

// New User Page
router.get('/new', function(req, res) {
    res.render('new', {
        loggedIn: false
    });
});


// New User Signup
router.post('/', async function(req, res) {

    try {
        let tokenValidity = await invitationServices.isValid(req.body.code, true);
        if (!tokenValidity) {
            req.flash('error', 'The token you entered is either invalid or expired. Please contact your counselor for a new one.');
            res.redirect('back');
            return;
         }

         await userServices.registerUser(makeAdmin, req);
         req.flash('success', 'Your account was successfully created!')
         res.redirect('/');
    }

    catch(error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});


// User Dashboard (regular or admin)
router.get('/:username', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let userData = await userServices.loadUserData(req.params.username, req);
        userServices.updateLastLoggedIn(userData.populatedUser);

        if (userData.populatedUser.admin){
            res.render('./admin/dashboard', {
                user: userData.populatedUser,
                users: userData.users,
                notifs: userData.allNotifs,
                unseenNotifs: userData.unseenNotifs,
                format: format,
                activeInvitations: userData.activeInvitations,
                expiredInvitations: userData.expiredInvitations,
                context: userData.pageContext,
                loggedIn: true,
                groupId: userData.groupToLoad
            });
        }

        else {
            res.render('show', {
                user: userData.populatedUser,
                notifs: userData.allNotifs,
                unseenNotifs: userData.unseenNotifs,
                format: format,
                tasks: userData.tasks,
                articles: userData.articles,
                context: userData.pageContext,
                loggedIn: true
            });
        }
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});


// Delete
router.delete('/:username', authServices.isAdmin, async function(req, res) {

    try {
        let userToDelete = await dbopsServices.findOneEntryAndPopulate(User,
            {'username': req.params.username}, [ ], true);

        await dbopsServices.findEntryByIdAndRemove(User, userToDelete._id);
    }

    catch (error) {
        req.flash('error', error.message);
    }

    res.redirect('back');
});

module.exports = router;
