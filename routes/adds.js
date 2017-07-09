// An 'Add' is a file submitted to elongate a submission thread

// Packages
let express = require("express"),
    path = require('path'),
    fs = require("fs"), // To read-from/write-to files
    authServices = require('../services/auth-services'),
    helpers = require('../helpers'),
    filesystemServices = require('../services/filesystem-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services');

// Models
let Submission = require("../models/submission"),
    Add        = require("../models/add");

let router = express.Router({
    mergeParams: true
});

// Download file (Get add)
router.get('/:addId', authServices.confirmUserCredentials, function(req, res) { 
    let add = Add.findOne({ '_id' : req.params.addId }).populate('submission').exec(
    function(error, foundAdd){
        if (error) { req.flash('error', 'Could not load file metadata') }
        res.download(filesystemServices.getExistingFilePath(foundAdd, req));
    });
});

// Delete File (Delete add)
router.delete('/:addId', authServices.confirmUserCredentials, function(req, res) { 
    let username = req.params.username;
    Add.findOne({
        '_id' : req.params.addId
    }).populate('submission').exec(function(error, foundAdd){
        let filePath = filesystemServices.getExistingFilePath(foundAdd, req);
        fs.unlink(filePath, function(error){
        if (error){
           req.flash("error", "File could not be localized for deletion!");
           res.redirect('/index/' + username + '/submit/');
        } else {
            Add.findByIdAndRemove(foundAdd._id, function(error){
                if (error){ req.flash("error", "File deleted but entry still in db!") }
                else {
                    req.flash("success", "File successfully deleted!");
                    res.redirect('/index/' + username + '/submit/' + req.params.id); 
                }
            });
            }
        });
    });
});

// New Update file to a thread
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.params.username,
        foundSub = await dbopsServices.findOneEntryAndPopulate(Submission, { '_id': req.params.id }, ['user'], req, res),
        fileMetadata = await filesystemServices.saveUploadedFile(username, foundSub, req, res),
        newAddModelData = new Add({file: fileMetadata.filenameNoExt, author: req.user.username, ext:fileMetadata.ext, submission: foundSub}),
        newAdd = await dbopsServices.createEntryAndSave(Add, newAddModelData, req, res);
        
    foundSub.adds.push(newAdd);
    dbopsServices.savePopulatedEntry(foundSub, req, res);
    notifServices.assignNotification(req.user.username, foundSub.title, 'add', foundSub.user.username, req);
    req.flash('success', 'file successfully uploaded for review');
    res.redirect('/index/' + username + '/submit/' + foundSub._id);
});

module.exports = router;