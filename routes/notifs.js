// Packages
var express = require("express"),
    middleware = require('../middleware');

// Models
var Notif = require("../models/notif"),
    User  = require("../models/user"),
    format = require('../notifJson');

// To be Exported
var router = express.Router({
    mergeParams: true
}); // To allow linking routing from this file to router (For cleaner code)

// View Notifs - GET
router.get('/', middleware.isLoggedIn, function(req, res) {
    var unseenNotifs = [];
    var seenNotifs = [];
    User.findOne({'username' : req.params.username}).populate('notifs').exec(function(error, foundUser){
        // Create a list of only UNSEEN notifications
     var allNotifs = foundUser.notifs;
        allNotifs.slice(0).forEach(function(notif){
        if (notif.seen){
            seenNotifs.push(notif)
        } else {
            unseenNotifs.push(notif);
        }
    });   
        console.log('seen', seenNotifs, 'unseen', unseenNotifs)
        res.render('notifs', {
            user: foundUser,
            loggedIn: true,
            format: format,
            unseenNotifs: unseenNotifs.reverse(),
            seenNotifs: seenNotifs.reverse(),
            viewer: req.user,
            client: foundUser
        });
    });
});

// Notif Seen - PUT
router.get('/:id/seen', middleware.isLoggedIn, function(req, res) {
    Notif.findById(req.params.id, function(error, foundNotif){
        foundNotif.seen = true;
        foundNotif.save(function(error){
            if (error){
                req.flash('error', 'Could not mark this notification as seen!')
            } else {
                res.redirect('back');
            }
        });
    });
});

// Notif Unseen - PUT
router.get('/:id/unseen', middleware.isLoggedIn, function(req, res) {
    Notif.findById(req.params.id, function(error, foundNotif){
        foundNotif.seen = false;
        foundNotif.save(function(error){
            if (error){
                req.flash('error', 'Could not mark this notification as seen!')
            } else {
                res.redirect('back');
            }
        });
    });
});

module.exports = router;
