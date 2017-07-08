// Packages
var express = require("express"),
    middleware = require('../middleware'),
    helpers = require('../helpers'),
    messageService = require('../services/message-services');

// Models
var User = require("../models/user"),
    Group = require("../models/group"),
    Message = require("../models/comment");

// To be Exported
var router = express.Router({
    mergeParams: true
}); // To allow linking routing from this file to router (For cleaner code)

// Show Messages (Personal for User)
router.get('/personal/', middleware.isLoggedIn, function(req, res) {
    User.findOne({
        'username': req.params.username
    }).populate('messages').exec(function(error, client) {
        if (error) {
            req.flash('error', 'Could not populate personal messages!');
            return res.redirect('back');
        }
        else {
            res.render('personalMessages', {
                user: client,
                viewer: req.user,
                loggedIn: true,
                client: client
            });
        }
    });
});

// Show Messages (For a Group)
router.get('/group/', middleware.isLoggedIn, function(req, res) {
    User.findOne({
        'username': req.params.username
    }, function(error, foundClient) {
        if (error) {
            req.flash('error', 'Could not locate user record at this time!');
            return res.redirect('back');
        }
        else {
            Group.findOne({
                'name': foundClient.group
            }).populate(['messages', 'users']).exec(function(error, foundGroup) {
                if (error) {
                    req.flash('error', 'Could not populate your group messages!');
                    return res.redirect('back');
                }
                else {
                    res.render('groupMessages', {
                        messages: foundGroup['messages'],
                        loggedIn: true,
                        user: foundClient,
                        users: foundGroup.users,
                        viewer: req.user,
                        client: foundClient
                    });
                }
            });
        }
    });
});

// New Message - POST (to a user's personal inbox)
router.post('/personal/', middleware.isLoggedIn, function(req, res) {
    // Term client is used for when sure that person is the user because we save messages to users, not admin
    var clientUsername = req.params.username;
    var sender = req.user; // Can be same or opposite dep on if user or admin is sending
    var newM = new Message({
        username: sender.username,
        content: req.body.textareacontent
    });

    Message.create(newM, function(error, newMessage) {
        if (error) {
            req.flash('error', 'Could not post this new message!');
            return res.redirect('back');
        }
        else {
            newMessage.save(function(error, data) {
                if (error) {
                    req.flash('error', 'Could not post this new message!');
                    return res.redirect('back');
                }
                else {
                    // Need to find client's account
                    User.findOne({
                        'username': clientUsername
                    }, function(error, foundUser) {
                        foundUser.messages.push(newMessage);
                        foundUser.save(function(error, data) {
                            if (error) {
                                req.flash('error', 'Could not post this new message!');
                                return res.redirect('back');
                            }
                            else {
                                if (sender.admin) {
                                    helpers.assignNotif(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', foundUser._id);
                                }
                                else {
                                    helpers.assignNotif(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', 'admin');
                                }

                                res.redirect('/index/' + clientUsername + '/messages/personal');
                            }
                        });
                    });

                }
            });
        }
    });

});

// New Message - POST (to a group inbox)
router.post('/group/', middleware.isLoggedIn, function(req, res) {
    var sender = req.user;
    var clientUsername = req.params.username;
    var newM = new Message({
        username: sender.username,
        content: req.body.textareacontent
    });
    User.findOne({
        'username': clientUsername
    }, function(error, foundClient) {
        if (error) {
            req.flash('error', 'Could not locate user!');
            return res.redirect('back');
        }
        else {
            var groupName = foundClient.group;
            Group.findOne({
                'name': groupName
            }).populate('users').exec(function(error, foundGroup) {
                if (error) {
                    req.flash('error', 'Could not locate user group!');
                    return res.redirect('back');
                }
                else {
                    Message.create(newM, function(error, newMessage) {
                        if (error) {
                            req.flash('error', 'Could not post this new message!');
                            return res.redirect('back');
                        }
                        else {
                            newMessage.save(function(error, data) {
                                if (error) {
                                    req.flash('error', 'Could not post this new message!');
                                    return res.redirect('back');
                                }
                                else {
                                    foundGroup.messages.push(newMessage);
                                    foundGroup.save(function(error, data) {
                                        if (error) {
                                            req.flash('error', 'Could not add this message to the rest of your group messages');
                                            return res.redirect('back');
                                        }
                                        else {
                                            foundGroup.users.forEach(function(receiver) {
                                                if (!(req.user.username === receiver.username)){
                                                    helpers.assignNotif(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver._id);
                                                }
                                            });
                                            if (!(sender.admin)){
                                                helpers.assignNotif(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', 'admin');
                                            }
                                            res.redirect('/index/' + clientUsername + '/messages/group');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });



        }
    });
});

module.exports = router;