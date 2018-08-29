// Packages
let express = require("express"),
    authServices = require('../services/auth-services'),
    aws = require('aws-sdk');

let router = express.Router({ mergeParams: true }),
    s3InitConfig = { signatureVersion: 'v4', endpoint: 's3.us-east-2.amazonaws.com', region: 'us-east-2' };

// Get signature for upload
router.get('/upload/:fileName', authServices.confirmUserCredentials, async function(req, res) { 
    let s3 = new aws.S3(s3InitConfig),
        key = req.params.username + '/' + req.params.subTitle + '/' + req.params.fileName,
        s3Params = { Bucket: process.env.S3_BUCKET, Key: key, Expires: 60, ContentType: req.query['file-type'], ACL: 'private' },
        signedUrl = s3.getSignedUrl('putObject', s3Params);
    res.write(JSON.stringify({ signedUrl : signedUrl }));
    res.end();
});

// Get signature for download
router.get('/download/:fileName', authServices.confirmUserCredentials, async function(req, res) { 
    let s3 = new aws.S3(s3InitConfig),
        key = req.params.username + '/' + req.params.subTitle + '/' + req.params.fileName,
        s3Params = { Bucket: process.env.S3_BUCKET, Key: key, Expires: 60 },
        signedUrl = s3.getSignedUrl('getObject', s3Params);
    res.write(JSON.stringify({ signedUrl: signedUrl, fileName: req.params.fileName }));
    res.end();
});

// Get signature for delete
router.get('/delete/:fileName', authServices.confirmUserCredentials, async function(req, res) { 
    let s3 = new aws.S3(s3InitConfig),
        key = req.params.username + '/' + req.params.subTitle + '/' + req.params.fileName,
        s3Params = { Bucket: process.env.S3_BUCKET, Key: key };
     s3.deleteObject(s3Params, function(err, data) {
        if (err) { console.log(err, err.stack) }
        else { 
            req.flash('success', 'File successfully deleted');
            res.redirect('back');
        }          
    });
});

module.exports = router;