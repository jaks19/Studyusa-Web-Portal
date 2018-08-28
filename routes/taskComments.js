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
        foundComment = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': req.params.commentId }, [ 'author' ], req, res),
        wait_time_minutes = 5;

    if (req.user.admin) {
        if (String(foundComment.author._id) === String(req.user._id)){
            foundComment.content = newText;
            await dbopsServices.savePopulatedEntry(foundComment, req, res);
        }
    } else if (String(foundComment.author._id) === String(req.user._id) && (new Date(foundComment.date) > (Date.now() - (wait_time_minutes*60*1000))) ){
        foundComment.content = newText;
        await dbopsServices.savePopulatedEntry(foundComment, req, res);
    }

    dbopsServices.savePopulatedEntry(foundComment, req, res);
    res.redirect('back');
});

// Delete Comment
router.delete('/:commentId', authServices.confirmUserCredentials, async function(req, res) {
    let comment = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': req.params.commentId }, [ 'author' ], req, res),
        wait_time_minutes = 5.1;  //(add epsilon just in case person clicks UI but time is up before request served)

    if (req.user.admin) {
        if (String(comment.author._id) === String(req.user._id)){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId, req, res);
        }
    } else if (String(comment.author._id) === String(req.user._id) && (new Date(comment.date) > (Date.now() - (wait_time_minutes*60*1000))) ){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId, req, res);
    }

    res.redirect('back');
});


// New Comment (Model for efficient search and creation! ref: mongoose tip)
router.post('/:userId', authServices.confirmUserCredentials, async function(req, res) {
    let content = req.body.textareacontent,
        newCommentObject;

    // Finding the taskSubscriber directly through taskId and userId is as fast as through taskSubscriberId
    // Because we created an index for this combination
    let taskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
        'task': req.params.taskId,
        'user': req.params.userId
    }, [ 'comments' ], req, res);

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

    let newComment = await dbopsServices.createEntryAndSave(Commentary, newCommentObject, req, res, true);
    console.log(newComment);

    taskSubscriber.comments = taskSubscriber.comments.concat([newComment]);
    await dbopsServices.savePopulatedEntry(taskSubscriber, req, res);
    // notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req, res);
    res.redirect('back');
});

module.exports = router;
