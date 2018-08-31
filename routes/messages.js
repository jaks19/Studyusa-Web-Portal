const express = require("express");
const authServices = require('../services/auth-services');
const notifServices = require('../services/notif-services');
const dbopsServices = require('../services/dbops-services');

const User = require("../models/user");
const Group = require("../models/group");
const Commentary = require("../models/commentary");

let router = express.Router({ mergeParams: true });

// Show Personal Messages
router.get('/:userId', authServices.confirmUserIdentity, async function(req, res) {

    try {
        let student = await dbopsServices.findOneEntryAndPopulate(User, { '_id': req.params.userId }, [ 'messages' ], true);
        // In future with many admins, need to filter on admin's id
        res.render('personalMessages', {
            user: req.user,
            loggedIn: true,
            student: student
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});

// New Personal Message
router.post('/:userId', authServices.confirmUserIdentity, async function(req, res) {
    try {
        let foundStudent = await dbopsServices.findOneEntryAndPopulate(User, { '_id': req.params.userId }, [], false);
        let sender = req.user;

        let [ author, recipient, content ] = [ sender._id, undefined, req.body.textareacontent ];
        if (String(sender._id) !== String(foundStudent._id)){ recipient = foundStudent._id }

        let newMessageData = new Commentary({ author: author, recipient: recipient, content: content });
        let newMessage = await dbopsServices.savePopulatedEntry(newMessageData);

        foundStudent.messages = foundStudent.messages.concat([ newMessage ]);
        await dbopsServices.savePopulatedEntry(foundStudent);
        // notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', foundClient.username, req, res);
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect('back');
});

module.exports = router;
