// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services');

// Models
var Task = require("../models/task"),
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
        foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { '_id': req.params.taskId }, [ 'users' ], req, res),
        newCommentObject,
        recipient;

    if (req.user.admin){
        recipient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ ], req, res);
        newCommentObject = new Commentary({ author: req.user, recipient: recipient, content: content })
    } else {
        newCommentObject = new Commentary({ author: req.user, content: content })
    }

    let newComment = await dbopsServices.createEntryAndSave(Commentary, newCommentObject, req, res, true); // does not retun the object
    foundTask.comments = foundTask.comments.concat([newComment]);
    await dbopsServices.savePopulatedEntry(foundTask, req, res);
    // notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req, res);
    res.redirect('back');
});

module.exports = router;
