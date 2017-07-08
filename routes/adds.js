// An 'Add' is a file submitted to elogate a submission thread

// Packages
var express = require("express"),
    path = require('path'),
    Multiparty = require("multiparty"), // To get file object upon selection from pc for upload
    fs = require("fs"), // To read-from/write-to files
    middleware = require('../middleware'),
    helpers = require('../helpers');

// Models
var Submission = require("../models/submission"),
    Add        = require("../models/add");

// To be Exported
var router = express.Router({
    mergeParams: true
}); // To allow linking routing from this file to router (For cleaner code)

// Download file (Get add)
router.get('/:addId', middleware.isLoggedIn, function(req, res) { 
    var username = req.params.username;
    var add = Add.findOne({
        '_id' : req.params.addId
    }).populate('submission').exec(function(error, foundAdd){
        var folderSlashFile = foundAdd.submission.folder + '/' + foundAdd.file;
        var ext = foundAdd['ext'];
        var filePath = path.resolve(".")+'/uploads/' + username + '/' + folderSlashFile + ext;
        res.download(filePath); // magic of download function
    });
});

// Delete File (Delete add)
router.delete('/:addId', middleware.isLoggedIn, middleware.isAdmin, function(req, res) { 
    var username = req.params.username;
    Add.findOne({
        '_id' : req.params.addId
    }).populate('submission').exec(function(error, foundAdd){
        var folderSlashFile = foundAdd.submission.folder + '/' + foundAdd.file;
        var ext = foundAdd['ext'];
        var filePath = path.resolve(".")+'/uploads/' + username + '/' + folderSlashFile + ext;
        fs.unlink(filePath, function(error){
        if (error){
           req.flash("error", "File could not be localized for deletion!");
           res.redirect('/index/' + username + '/submit/');
        } else {
            Add.findByIdAndRemove(foundAdd._id, function(error){
                if (error){
                    req.flash("error", "File deleted but entry still in db!");
                } else {
                    req.flash("success", "File successfully deleted!");
                    res.redirect('/index/' + username + '/submit/' + req.params.id); 
                }
            });
            }
        });
    });
});

// New Update file to a thread
router.post('/', middleware.isLoggedIn, function(req, res) {
    // Parse form with 'multiparty' because we are uploading a file and it is an encoded form
    var form = new Multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var username = req.params.username,
            dirname = path.resolve(".") + '/uploads/' + username + '/', // path.resolve(“.”) get application directory path
            subId = req.params.id;

        Submission.findOne({
            '_id': subId
        }).populate('user').exec(function(error, foundSub) {
            if (error) {
                req.flash('error', 'Error retrieving this thread from your records!');
                res.redirect('back');
            }
            else {
                var foldername = foundSub['folder'];

                // ** Save actual file data in uploads folder first as more risky to fail
                // Target is to have file in the same folder as original file in the thread
                var file = files['doc'][0]; // Actual DOC
                var filenameWithExt = file['originalFilename'];
                fs.readFile(file['path'], function(err, data) { // readfile from the given path
                    if (err) {
                        req.flash('error', 'Cannot read the file you uploaded!');
                        res.redirect('back');
                    }
                    else {
                        var ext = filenameWithExt.substring(filenameWithExt.indexOf('.')); // get file extension. CAREFUL AS NEED NEW FILE'S EXTENSION!!
                        var filenameNoExt = filenameWithExt.substring(0, file['originalFilename'].indexOf('.'));
                        var newPath = dirname + foldername + '/' + filenameWithExt;
                        fs.writeFile(newPath, data, function(err) { // write file in uploads folder
                            if (err) {
                                req.flash('error', 'Could not write file to the specified location!');
                                res.redirect('back');
                            }
                            else {
                                var newA = new Add({
                                            file: filenameNoExt,
                                            author: req.user.username,
                                            ext: ext,
                                            submission: foundSub
                                            });
                                
                                Add.create(newA, function(error, newAdd){
                                    if (error){
                                        req.flash('error', 'Could add file to thread!');
                                        res.redirect('back');
                                    } else {
                                        newAdd.save(function(error, data){
                                           if (error){
                                               req.flash('error', 'Could not save file to the specified location!');
                                                res.redirect('back');
                                           } else {
                                                foundSub.adds.push(newAdd);
                                                foundSub.save(function(error, updatedSub) {
                                                    if (error) {
                                                        req.flash('error', 'Could not save the thread with the new file!');
                                                        res.redirect('back');
                                                    }
                                                    else {
                                                        // After updating db and saving file, redirect to viewFile
                                                        if (req.user.admin){
                                                            helpers.assignNotif(req.user.username, foundSub.title, 'add', foundSub.user._id, req);
                                                        } else {
                                                            helpers.assignNotif(req.user.username, foundSub.title, 'add', 'admin', req);
                                                        }
                                                        res.redirect('/index/' + username + '/submit/' + updatedSub._id);
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

module.exports = router;
