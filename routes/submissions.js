// Packages
let express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    filesystemServices = require('../services/filesystem-services'),
    notifServices = require('../services/notif-services');

// Models
let User = require("../models/user"),
    Submission = require("../models/submission"),
    Comment = require("../models/comment"),
    Add = require("../models/add");

let router = express.Router({ mergeParams: true });

// New Submission
router.get('/',authServices.confirmUserCredentials, async function(req, res) {
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ 'submissions' ], req, res);
    res.render('submit', {
        loggedIn: true,
        user: req.user,
        client: foundUser
    });
});

// New Submission
router.post('/', authServices.confirmUserCredentials, async function(req, res) { //IMPORTANT: normally you would use a post request to an index page but I already have one POST req going there for Users
    let fileData = await filesystemServices.getNewFileMetadata(req, res),
        newSubData = new Submission({ title: fileData.title }),
        newSubmission = await dbopsServices.createEntryAndSave(Submission, newSubData, req, res, false),
        foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ ], req, res),
        newAddData = new Add({ file: fileData.fileName, author: foundUser.username, submission: newSubmission }),
        newAdd = await dbopsServices.createEntryAndSave(Add, newAddData, req, res),
        newCommentData = new Comment({ username: req.user.username, content: fileData.message }),
        newComment = await dbopsServices.createEntryAndSave(Comment, newCommentData, req, res);
       
    newSubmission.user = foundUser;
    newSubmission.messages.push(newComment);
    newSubmission.adds.push(newAdd);
    dbopsServices.savePopulatedEntry(newSubmission, req, res);                                         
    foundUser.submissions.push(newSubmission);
    dbopsServices.savePopulatedEntry(foundUser, req, res);         
    notifServices.assignNotification(req.user.username, newSubData.title, 'add', req.params.username, req);
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
