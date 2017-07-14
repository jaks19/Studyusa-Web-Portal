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
    res.render('personalMessages', { user: client, loggedIn: true, client: client });
});

// Show Group Messages
router.get('/group/', authServices.confirmUserCredentials, async function(req, res) {
    let foundClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { 'name': foundClient.group }, [ 'messages', 'users' ], req, res);
    res.render('groupMessages', { messages: foundGroup['messages'], loggedIn: true, user: foundClient, users: foundGroup.users, client: foundClient });
});

// New Personal Message
router.post('/personal/', authServices.confirmUserCredentials, async function(req, res) {
    let foundClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res),
        sender = req.user,
        newM = new Message({ username: sender.username, content: req.body.textareacontent }),
        newMessage = await dbopsServices.createEntryAndSave(Message, newM, req, res);

    foundClient.messages.push(newMessage);
    dbopsServices.savePopulatedEntry(foundClient, req, res);
    notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', foundClient.username, req);
    res.redirect('/index/' + foundClient.username + '/messages/personal');
});

// New Group Message
router.post('/group/', authServices.confirmUserCredentials, async function(req, res) {
    let sender = req.user,
        oneClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { 'name': oneClient.group }, [ 'users' ], req, res),
        newM = new Message({ username: sender.username, content: req.body.textareacontent }),
        newMessage = await dbopsServices.createEntryAndSave(Message, newM, req, res);
        foundGroup.messages.push(newMessage);
        dbopsServices.savePopulatedEntry(foundGroup, req, res);
        foundGroup.users.forEach(function(receiver) {
            notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver.username, req);
        });
        res.redirect('back');
});

module.exports = router;