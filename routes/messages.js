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
router.get('/personal/', authServices.confirmUserCredentials, async function(req, res) {
    let client = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ 'messages' ], req, res);
    res.render('personalMessages', { user: req.user, messages: client.messages, loggedIn: true, client: client });
});

// Show Group Messages
// ROUTE DEPRECATED TO a route from groups /index/username/groups/groupid/messages/
router.get('/group/', authServices.confirmUserCredentials, async function(req, res) {
    let foundClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { 'name': foundClient.group }, [ 'messages', 'users' ], req, res);
    res.render('groupMessages', { messages: foundGroup['messages'], loggedIn: true, user: req.user, users: foundGroup.users, client: foundClient });
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
