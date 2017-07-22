// A 'Comment' is added to a submission to keep track of the thread
// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services');

// Models
var Submission = require("../models/submission"),
    Comment = require("../models/comment");

var router = express.Router({ mergeParams: true });

// New Comment
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let subId = req.params.id,
        content = req.body.textareacontent,
        foundSub = await dbopsServices.findOneEntryAndPopulate(Submission, { '_id': subId }, ['user'], req, res),
        newC = new Comment({ username: req.user.username, content: content }),
        newComment =  await dbopsServices.createEntryAndSave(Comment, newC, req, res);
    foundSub.messages.push(newComment);
    dbopsServices.savePopulatedEntry(foundSub, req, res);
    notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req, res);
    res.redirect('/index/' + foundSub.user.username + '/submit/' + foundSub._id);
});

// Edit Comment
router.put('/:commentId/', authServices.confirmUserCredentials, async function(req, res) {
    let newText = req.body.newText;
    let foundComment = await dbopsServices.findOneEntryAndPopulate(Comment, {'_id': req.params.commentId}, [], req, res);
    foundComment.content = newText;
    dbopsServices.savePopulatedEntry(foundComment, req, res);
    req.flash('success', 'Comment successfully changed');
    res.redirect('back');
});


// Delete Comment
router.delete('/:commentId/', authServices.confirmUserCredentials, async function(req, res) {
    await dbopsServices.findEntryByIdAndRemove(Comment, req.params.commentId, req, res);
    res.redirect('back');
});
module.exports = router;
