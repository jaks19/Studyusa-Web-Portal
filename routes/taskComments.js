const express = require("express");
const authServices = require('../services/auth-services');
const dbopsServices = require('../services/dbops-services');
const notifServices = require('../services/notif-services');
const taskCommentsServices = require('../services/task-comments-services');

const Task = require("../models/task");
const TaskSubscriber = require("../models/taskSubscriber");
const Commentary = require("../models/commentary");


let router = express.Router({ mergeParams: true });

// Edit Comment
router.put('/:commentId', authServices.confirmUserCredentials, async function(req, res) {
    try {
        let editedText = req.body.newText;
        let foundComment = await dbopsServices.findOneEntryAndPopulate(Commentary,
            { '_id': req.params.commentId }, [ 'author' ], false);

        let editableTimeIntervalInMinutes = 5;

        if (taskCommentsServices.theCommentIsStillEditable(req.user,
            foundComment, editableTimeIntervalInMinutes)){

            foundComment.content = editedText;
            await dbopsServices.savePopulatedEntry(foundComment);
        }
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect('back');
});


// Delete Comment
router.delete('/:commentId', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let commentToDelete = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': req.params.commentId }, [ 'author' ], true);
        let editableTimeIntervalInMinutes = 5.1;  //(add epsilon just in case person clicks UI but time is up before request served)

        if (taskCommentsServices.theCommentIsStillEditable(req.user,
            commentToDelete, editableTimeIntervalInMinutes)){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId);
        }
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect('back');
});


// New Comment (Model for efficient search and creation! ref: mongoose tip)
router.post('/:userId', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let thisTaskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
                user: req.params.userId,
                task: req.params.taskId
            }, [ 'comments' ], false);

        // No recipient if user to admin assuming only one admin.
        // If in the future, have multiple admins, need a way to grab id of who the person is replying to
        let [ author, recipient, content ] = [ req.user._id, undefined, req.body.textareacontent ];
        if (req.user.admin) { recipient = req.params.userId }

        let newCommentObject = new Commentary({ author: author, recipient: recipient, content: content });
        let savedComment = await dbopsServices.savePopulatedEntry(newCommentObject);

        thisTaskSubscriber.comments = thisTaskSubscriber.comments.concat([ savedComment ]);
        await dbopsServices.savePopulatedEntry(thisTaskSubscriber);
        // notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req, res);
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect('back');
});

module.exports = router;
