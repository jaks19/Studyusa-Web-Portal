// A 'Comment' is added to a submission to keep track of the thread

// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    helpers = require('../helpers');

// Models
var Submission = require("../models/submission"),
    Comment = require("../models/comment"),
    User = require("../models/user");

// To be Exported
var router = express.Router({
    mergeParams: true
}); // To allow linking routing from this file to router (For cleaner code)

// New Comment - POST
router.post('/', authServices.confirmUserCredentials, function(req, res) {
    var subId = req.params.id;
    var content = req.body.textareacontent;

    Submission.findOne({
        '_id': subId
    }).populate('user').exec(function(error, foundSub) {
        if (error) {
            req.flash('error', 'Could not retrieve thread to post comment to it');
            res.redirect('back');
        }
        else {
            var newC = new Comment({
                username: req.user.username,
                content: content
            });
            Comment.create(newC, function(error, newComment) {
                if (error) {
                    req.flash('error', 'Comment failed to be created!');
                    res.redirect('back');
                }
                else {
                    newComment.save(function(error, data) {
                        if (error) {
                            req.flash('error', 'Could not save the new comment!');
                            res.redirect('back');
                        }
                        else {
                            foundSub.messages.push(newComment);
                            foundSub.save(function(error, data) {
                                if (error) {
                                    req.flash('error', 'Could not save the thread with its new comment!');
                                    res.redirect('back');
                                }
                                else {
                                    if (req.user.admin){
                                        User.findOne({'username': foundSub.user.username}, function(error, foundUser){
                                            if (error){
                                            } else {
                                                helpers.assignNotif(req.user.username, foundSub.title, 'comment', foundUser._id, req);
                                            }
                                        });
                                    } else {
                                        helpers.assignNotif(req.user.username, foundSub.title, 'comment', 'admin', req);
                                    }
                                    res.redirect('/index/' + foundSub.user.username + '/submit/' + foundSub._id);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// Edit Comment - PUT
// '/index/:username/submit/:id/comments' + '/commentId'
router.put('/:commentId/', authServices.confirmUserCredentials, function(req, res) {
    var newText = req.body.newText;
    Comment.findOne({'_id': req.params.commentId}, function(error, foundComment){
        if (error){
            req.flash('error', "Could not find this comment's record!");
        } else {
            foundComment.content = newText;
            foundComment.save(function(error, data){
                if (error){
                    req.flash('error', 'Could not save the new comment text!');
                } else {
                    res.redirect('back');
                }
            });
        }
    });
});


// Delete Comment - DELETE
// '/index/:username/submit/:id/comments' + '/commentId'
router.delete('/:commentId/', authServices.confirmUserCredentials, function(req, res) {
    Comment.findByIdAndRemove(req.params.commentId, function(error){
        if (error){
            req.flash("error", "Comment could not be deleted!");
        } else {
            req.flash("success", "Comment successfully deleted!");
            res.redirect('back'); 
        }        
    });
});
module.exports = router;
