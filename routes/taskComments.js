// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services'),
    mongoose = require('mongoose');

// Models
var Task = require("../models/task"),
    TaskSubscriber  = require("../models/taskSubscriber"),
    Commentary = require("../models/commentary"),
    User = require("../models/user");

let router = express.Router({ mergeParams: true });

// Edit Comment
router.put('/:commentId', authServices.confirmUserCredentials, async function(req, res) {
    let newText = req.body.newText,
        foundComment = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': req.params.commentId }, [ 'author' ], false),
        wait_time_minutes = 5;

    if (req.user.admin) {
        if (String(foundComment.author._id) === String(req.user._id)){
            foundComment.content = newText;
            await dbopsServices.savePopulatedEntry(foundComment);
        }
    } else if (String(foundComment.author._id) === String(req.user._id) && (new Date(foundComment.date) > (Date.now() - (wait_time_minutes*60*1000))) ){
        foundComment.content = newText;
        await dbopsServices.savePopulatedEntry(foundComment);
    }

    dbopsServices.savePopulatedEntry(foundComment);
    res.redirect('back');
});

// Delete Comment
router.delete('/:commentId', authServices.confirmUserCredentials, async function(req, res) {
    let comment = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': req.params.commentId }, [ 'author' ], true),
        wait_time_minutes = 5.1;  //(add epsilon just in case person clicks UI but time is up before request served)

    if (req.user.admin) {
        if (String(comment.author._id) === String(req.user._id)){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId);
        }
    } else if (String(comment.author._id) === String(req.user._id) && (new Date(comment.date) > (Date.now() - (wait_time_minutes*60*1000))) ){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId);
    }

    res.redirect('back');
});


// New Comment (Model for efficient search and creation! ref: mongoose tip)
router.post('/:userId', authServices.confirmUserCredentials, async function(req, res) {
    let content = req.body.textareacontent,
        newCommentObject,
        foundTask = await dbopsServices.findOneEntryAndDeepPopulate(Task,
            { '_id': req.params.taskId }, [ 'taskSubscribers.user', 'taskSubscribers.comments' ], false);

    let allTaskSubscribers = foundTask.taskSubscribers;
    let taskSubscriber = allTaskSubscribers.filter(ts => String(ts.user._id) === req.params.userId)[0]

    if (req.user.admin){
        newCommentObject = new Commentary({
            author: req.user._id, // Id object works
            recipient: req.params.userId, // Id String also works
            content: content })
    } else {
        // No recipient. If in the future, have multiple admins, will have a
        // reply option perhaps and a way to grab id of who the person is replying to
        newCommentObject = new Commentary({
            author: req.user._id,
            content: content })
    }

    let newComment = await dbopsServices.savePopulatedEntry(newCommentObject);
    taskSubscriber.comments = taskSubscriber.comments.concat([newComment]);
    await dbopsServices.savePopulatedEntry(taskSubscriber);
    // notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req, res);
    res.redirect('back');
});

module.exports = router;
