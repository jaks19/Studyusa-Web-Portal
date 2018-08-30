// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    notifServices = require('../services/notif-services'),
    dbopsServices = require('../services/dbops-services');

// Models
var User = require("../models/user"),
    Group = require("../models/group"),
    Message = require("../models/comment");

var router = express.Router({ mergeParams: true });

// Show Personal Messages
router.get('/personal', authServices.confirmUserCredentials, async function(req, res) {
    let user = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ 'messages' ], req, res);
    // In future with many admins, need to filter on admin's id
    res.render('personalMessages', { user: req.user, messages: user.messages, loggedIn: true, client: client });
});

// New Personal Message
router.post('/personal/', authServices.confirmUserCredentials, async function(req, res) {
    let foundClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res),
        sender = req.user,
        newM = new Message({ username: sender.username, content: req.body.textareacontent }),
        newMessage = await dbopsServices.savePopulatedEntry(newM, req, res);

    foundClient.messages.push(newMessage);
    dbopsServices.savePopulatedEntry(foundClient, req, res);
    notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', foundClient.username, req, res);
    res.redirect('/index/' + foundClient.username + '/messages/personal');
});

module.exports = router;
