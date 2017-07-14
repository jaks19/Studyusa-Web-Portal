// An 'Add' is a file submitted to elongate a submission thread

// Packages
let express = require("express"),
    fs = require("fs"), // To read-from/write-to files
    authServices = require('../services/auth-services'),
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
router.get('/:addId', authServices.confirmUserCredentials, async function(req, res) { 
    let foundAdd = await dbopsServices.findOneEntryAndPopulate(Add, { '_id' : req.params.addId }, [ 'submission' ], req, res);
    res.download(filesystemServices.getExistingFilePath(foundAdd, req));
});

// Delete File (Delete add)
router.delete('/:addId', authServices.confirmUserCredentials, async function(req, res) { 
    let username = req.params.username,
        foundAdd = await dbopsServices.findOneEntryAndPopulate(Add, { '_id': req.params.addId }, ['submission'], req, res),
        filePath = filesystemServices.getExistingFilePath(foundAdd, req);
    fs.unlinkSync(filePath);
    await dbopsServices.findEntryByIdAndRemove(Add, foundAdd._id, req, res);
    res.redirect('/index/' + username + '/submit/' + req.params.id);
});

// New Update file to a thread
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.params.username,
        foundSub = await dbopsServices.findOneEntryAndPopulate(Submission, { '_id': req.params.id }, ['user'], req, res),
        fileMetadata = await filesystemServices.saveAddedFile(username, foundSub, req, res),
        newAddModelData = new Add({file: fileMetadata.filenameNoExt, author: req.user.username, ext:fileMetadata.ext, submission: foundSub}),
        newAdd = await dbopsServices.createEntryAndSave(Add, newAddModelData, req, res);
        
    foundSub.adds.push(newAdd);
    dbopsServices.savePopulatedEntry(foundSub, req, res);
    notifServices.assignNotification(req.user.username, foundSub.title, 'add', foundSub.user.username, req);
    req.flash('success', 'file successfully uploaded for review');
    res.redirect('/index/' + username + '/submit/' + foundSub._id);
});

module.exports = router;