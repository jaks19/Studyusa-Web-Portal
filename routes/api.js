const express      = require("express");
const aws          = require('aws-sdk');

const authServices = require('../services/auth-services');
const dbopsServices  = require('../services/dbops-services');

const User = require("../models/user");
const Workspace = require("../models/workspace");
const UploadedDocument = require("../models/uploadedDocument");

let router = express.Router({ mergeParams: true });

const configForS3Object = {
    signatureVersion: 'v4',
    endpoint: 's3.us-east-2.amazonaws.com',
    region: 'us-east-2'
};


// TODO: new auth here, just need to be ownser of workspace
router.get('/s3upload/:workspaceId', async function(req, res) {
    let fetchedWorkspace = await dbopsServices.findOneEntryAndPopulate(Workspace,
        { '_id': req.params.workspaceId }, [ ], true);
    let submissionOrResponse = isItAStudentSubmissionOrACounselorResponse(fetchedWorkspace);

    let s3FilePath = `${fetchedWorkspace.concernedStudentName}/${fetchedWorkspace.taskName}/${submissionOrResponse}${fetchedWorkspace.number}.html`;
    let s3Object = new aws.S3(configForS3Object);
    let s3Params = { Bucket: process.env.S3_BUCKET, Key: s3FilePath, Expires: 60, ContentType: 'text/html', ACL: 'private' };

    let signedUrlToUpload = s3Object.getSignedUrl('putObject', s3Params);
    res.write(JSON.stringify({ signedUrl: signedUrlToUpload}));

    res.end();
});


// TODO: auth here, check if wner of file asking to be downloaded
router.get('/s3download/:uploadedDocumentId', async function(req, res) {
    let s3 = new aws.S3(configForS3Object);
    let uploadedDocumentDoc = await dbopsServices.findOneEntryAndPopulate(UploadedDocument,
        { '_id': req.params.uploadedDocumentId }, [ ], true);

    let s3FilePath = uploadedDocumentDoc.s3Path + '.html';
    let s3Params = { Bucket: process.env.S3_BUCKET, Key: s3FilePath, Expires: 60 };

    let signedUrlToDownload = s3.getSignedUrl('getObject', s3Params);
    res.write(JSON.stringify({ signedUrl: signedUrlToDownload }));

    res.end();
});


// Given a workspace, returns 'response' if it is a counselor's workspace
// Else, returns 'submission'
// These strings are used to get the path of the file in aws
let isItAStudentSubmissionOrACounselorResponse = function (workspaceDoc) {
    if (workspaceDoc.authorName === workspaceDoc.concernedStudentName) { return 'Submission' }
    else { return 'Response' }
}


module.exports = router;
