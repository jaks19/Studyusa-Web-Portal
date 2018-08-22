// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services');

// Models
var Task = require("../models/task"),
    Commentary = require("../models/commentary");

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
        console.log('hit this branch ok');
        foundComment.content = newText;
        await dbopsServices.savePopulatedEntry(foundComment, req, res);
    }

    dbopsServices.savePopulatedEntry(foundComment, req, res);
    req.flash('success', 'Comment successfully changed');
    res.redirect('back');
});

// Delete Comment
router.delete('/:commentId', authServices.confirmUserCredentials, async function(req, res) {
    let comment = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': req.params.commentId }, [ 'author' ], req, res),
        wait_time_minutes = 5;

    if (req.user.admin) {
        if (String(comment.author._id) === String(req.user._id)){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId, req, res);
        }
    } else if (String(comment.author._id) === String(req.user._id) && (new Date(comment.date) > (Date.now() - (wait_time_minutes*60*1000))) ){
            await dbopsServices.findEntryByIdAndRemove(Commentary, req.params.commentId, req, res);
    }

    res.redirect('back');
});


// New Comment
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let content = req.body.textareacontent,
        foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { '_id': req.params.taskId }, [ 'users' ], req, res);

    // Admin needs recipient, else no recipient, since admin sends to everyone in a task
    let newC;
    if (!req.user.admin) { newC = new Commentary({ author: req.user, content: content }); }
    else { newC = new Commentary({ author: req.user, recipient: req.params.username, content: content }); }
    await dbopsServices.createEntryAndSave(Commentary, newC, req, res, true); // does not retun the object

    let newComment = await dbopsServices.findOneEntryAndPopulate(Commentary, { '_id': newC._id }, [ 'author' ], req, res);
    foundTask.comments = foundTask.comments.concat([newComment]);
    await dbopsServices.savePopulatedEntry(foundTask, req, res);
    // notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req, res);
    res.redirect('/index/' + req.user.username + '/tasks/' + foundTask._id);
});

module.exports = router;
