// Packages
var express = require("express"),
    path = require('path'),
    Multiparty = require("multiparty"), // To get file object upon selection from pc for upload
    fs = require("fs"), // To read-from/write-to files
    authServices = require('../services/auth-services'),
    mkdirp = require('mkdirp'),
    helpers = require('../helpers');

// Models
var User = require("../models/user"),
    Submission = require("../models/submission"),
    Comment = require("../models/comment"),
    Add = require("../models/add");

// To be Exported
var router = express.Router({
    mergeParams: true
});

// New Submission - GET
router.get('/',authServices.confirmUserCredentials, function(req, res) {
    var username = req.user.username;
    User.findOne({
        'username': username
    }).populate('submissions').exec(function(error, foundUser) {
        if (error) {
            req.flash('error', 'Could your user record!');
            res.redirect('back');
        }
        else {
            res.render('submit', {
                loggedIn: true,
                user: foundUser,
                client: foundUser
            });
        }
    });
});

// New Submission - POST
router.post('/', authServices.confirmUserCredentials, function(req, res) { //IMPORTANT: normally you would use a post request to an index page but I already have one POST req going there for Users
    // Parse form with 'multiparty' because we are uploading a file and it is an encoded form
    var form = new Multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var username = req.user.username,
            message = fields['message'][0],
            dirname = path.resolve(".") + '/uploads/' + username + '/', // path.resolve(“.”) get application directory path
            title = fields['title'][0],
            foldername;

        if (fields['newFolderName'][0].length != 0) {
            // If user wants file to go into a new folder// 
            foldername = fields['newFolderName'][0];
            // Also, actually create the folder!
            mkdirp(dirname + foldername, function(err) {
                if (err) {
                    req.flash('error', 'Could not create this new folder!');
                    res.redirect('back');
                }
            });
            // Else choosing a folder existing already
        }
        else {
            foldername = fields['chosenFolder'][0];
        }


        // ** Save actual file data in uploads folder first as more risky to fail
        // Target is to have file in uploads/user_name/foldername/filename.txt
        var file = files['doc'][0], // Actual DOC
            filenameWithExt = file['originalFilename'];
        fs.readFile(file['path'], function(err, data) { // readfilr from the given path
            if (err) {
                req.flash('error', 'Could not read the file you are trying to upload!');
                res.redirect('back');
            }
            else {
                var ext = filenameWithExt.substring(filenameWithExt.indexOf('.')); // get file extension
                var filenameNoExt = filenameWithExt.substring(0, file['originalFilename'].indexOf('.'));
                var newPath = dirname + foldername + '/' + filenameWithExt; // add the title given by user (forget the client's system name for file)
                fs.writeFile(newPath, data, function(err) { // write file in uploads folder
                    if (err) {
                        req.flash('error', 'Could not write the file to your uploads directory!');
                        res.redirect('back');
                    }
                    else {
                        // ** Now save the actual record in Submissions db and link to User
                        var newSub = new Submission({
                            title: title,
                            folder: foldername
                        });
                        Submission.create(newSub, function(error, newSubmission) {
                            if (error) {
                                req.flash('error', 'Could not create this new thread!');
                                res.redirect('back');
                            }
                            else {
                                User.findOne({
                                    'username': username
                                }, function(error, foundUser) {
                                    if (error) {
                                        req.flash('error', 'Could not retrieve your record to add this thread!');
                                        res.redirect('back');
                                    }
                                    else {
                                        var newC = new Comment({
                                            username: req.user.username,
                                            content: message
                                        });
                                        Comment.create(newC, function(error, newComment) {
                                            if (error) {
                                                req.flash('error', 'Could not add your comment!');
                                            }
                                            else {
                                                newComment.save(function(error, data) {
                                                    if (error) {
                                                        req.flash('error', 'Could not save your comment!');
                                                    } else{
                                                        var newA = new Add({
                                                            file: filenameNoExt,
                                                            author: foundUser.username,
                                                            ext: ext,
                                                            submission: newSubmission
                                                        });
                                                        Add.create(newA, function(error, newAdd){
                                                           if (error){
                                                               req.flash('error', 'Could not add your file!');
                                                           } else {
                                                               newAdd.save(function(error, data){
                                                                  if (error) {
                                                                      req.flash('error', 'Could not save your file!');
                                                                  } else {
                                                                        newSubmission.user = foundUser;
                                                                        newSubmission.messages.push(newComment);
                                                                        newSubmission.adds.push(newAdd);
                                                                        newSubmission.save(function(error, data) {
                                                                            if (error) {
                                                                                req.flash('error', 'Could not save this new thread!');
                                                                                res.redirect('back');
                                                                            }
                                                                        });
                                                                        foundUser.submissions.push(newSubmission);
                                                                        foundUser.save(function(error, data) {
                                                                            if (error) {
                                                                                req.flash('error', 'Could not save this new thread into your user record');
                                                                                res.redirect('back');
                                                                            }
                                                                            else { // After updating db and saving file, redirect to dashboard
                                                                                helpers.assignNotif(req.user.username, newSub.title, 'add', 'admin', req);
                                                                                res.redirect('/index/' + req.user.username);
                                                                            }
                                                                        });
                                                                  }
                                                               });
                                                           }
                                                        });
                                                    }
                                                });
                                                

                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

// Show Submission
router.get('/:id', authServices.confirmUserCredentials, function(req, res) {
    var id = req.params.id;
    Submission.findOne({
        '_id': id
    }).populate('user').populate('messages').populate('adds').exec(function(err, foundSub) {
        if (!err) {
            res.render('viewFile', {
                sub: foundSub,
                user: req.user,
                client: foundSub.user,
                loggedIn: true
            });
        }
    });
});

module.exports = router;
