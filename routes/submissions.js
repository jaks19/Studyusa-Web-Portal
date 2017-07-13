// Packages
let express = require("express"),
    path = require('path'),
    Multiparty = require("multiparty"), // To get file object upon selection from pc for upload
    fs = require("fs"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    filesystemServices = require('../services/filesystem-services'),
    notifServices = require('../services/notif-services'),
    mkdirp = require('mkdirp'),
    helpers = require('../helpers');

// Models
let User = require("../models/user"),
    Submission = require("../models/submission"),
    Comment = require("../models/comment"),
    Add = require("../models/add");

// To be Exported
let router = express.Router({ mergeParams: true });

// New Submission - GET
router.get('/',authServices.confirmUserCredentials, async function(req, res) {
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ 'submissions' ], req, res);
    res.render('submit', {
        loggedIn: true,
        user: req.user,
        client: foundUser
    });
});

// New Submission - POST
router.post('/', authServices.confirmUserCredentials, async function(req, res) { //IMPORTANT: normally you would use a post request to an index page but I already have one POST req going there for Users
    let fileMetadata = await filesystemServices.saveNewFile(req.params.username, req, res),
        newSub = new Submission({ title: fileMetadata.title, folder: fileMetadata.foldername }),
        newSubmission = await dbopsServices.createEntryAndSave(Submission, newSub, req, res, false),
        foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ ], req, res),
        newA = new Add({ file: fileMetadata.filenameNoExt, author: foundUser.username, ext: fileMetadata.ext, submission: newSubmission }),
        newC = new Comment({ username: req.user.username, content: fileMetadata.message }),
        newComment = await dbopsServices.createEntryAndSave(Comment, newC, req, res),
        newAdd = await dbopsServices.createEntryAndSave(Add, newA, req, res);
    newSubmission.user = foundUser;
    newSubmission.messages.push(newComment);
    newSubmission.adds.push(newAdd);
    dbopsServices.savePopulatedEntry(newSubmission, req, res);                                         
    foundUser.submissions.push(newSubmission);
    dbopsServices.savePopulatedEntry(foundUser, req, res);         
    notifServices.assignNotification(req.user.username, newSub.title, 'add', req.params.username, req);
    res.redirect('/index/' + req.params.username);
});

// Show Submission
router.get('/:id', authServices.confirmUserCredentials, async function(req, res) {
    let foundSub = await dbopsServices.findOneEntryAndPopulate(Submission, { '_id': req.params.id }, [ 'user', 'messages', 'adds' ], req, res);
    res.render('viewFile', {
        sub: foundSub,
        user: req.user,
        client: foundSub.user,
        loggedIn: true
    });
});

module.exports = router;
