// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    notifServices = require('../services/notif-services'),
    dbopsServices = require('../services/dbops-services');

// Models
var User = require("../models/user"),
    Group = require("../models/group"),
    Commentary = require("../models/commentary");

var router = express.Router({ mergeParams: true });

// Show Personal Messages
router.get('/:studentId', authServices.confirmUserCredentials, async function(req, res) {
    let student = await dbopsServices.findOneEntryAndPopulate(User, { '_id': req.params.studentId }, [ 'messages' ], req, res);
    console.log(student);
    // In future with many admins, need to filter on admin's id
    res.render('personalMessages', {
        user: req.user,
        loggedIn: true,
        student: student
    });
});

// New Personal Message
router.post('/:studentId', authServices.confirmUserCredentials, async function(req, res) {
    let foundStudent = await dbopsServices.findOneEntryAndPopulate(User, { '_id': req.params.studentId }, [], req, res),
        sender = req.user,
        newMessageData,
        newMessage;

    if (String(sender._id) === String(foundStudent._id)){
        newMessageData = new Commentary({ author: sender._id, content: req.body.textareacontent });
    } else {
        newMessageData = new Commentary({ author: sender._id, recipient: foundStudent._id, content: req.body.textareacontent });
    }

    newMessage = await dbopsServices.savePopulatedEntry(newMessageData, req, res);
    console.log(foundStudent);
    foundStudent.messages = foundStudent.messages.concat([ newMessage ]);
    console.log(foundStudent.messages);

    await dbopsServices.savePopulatedEntry(foundStudent, req, res);
    // notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', foundClient.username, req, res);
    res.redirect('back');
});

module.exports = router;
