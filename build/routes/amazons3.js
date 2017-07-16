'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    aws = require('aws-sdk');

var router = express.Router({ mergeParams: true }),
    s3InitConfig = { signatureVersion: 'v4', endpoint: 's3.us-east-2.amazonaws.com', region: 'us-east-2' };

// Get signature for upload
router.get('/upload/:fileName', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var s3, key, s3Params, signedUrl;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        s3 = new aws.S3(s3InitConfig), key = req.params.username + '/' + req.params.subTitle + '/' + req.params.fileName, s3Params = { Bucket: process.env.S3_BUCKET, Key: key, Expires: 60, ContentType: req.query['file-type'], ACL: 'private' }, signedUrl = s3.getSignedUrl('putObject', s3Params);

                        res.write((0, _stringify2.default)({ signedUrl: signedUrl }));
                        res.end();

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

// Get signature for download
router.get('/download/:fileName', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var s3, key, s3Params, signedUrl;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        s3 = new aws.S3(s3InitConfig), key = req.params.username + '/' + req.params.subTitle + '/' + req.params.fileName, s3Params = { Bucket: process.env.S3_BUCKET, Key: key, Expires: 60 }, signedUrl = s3.getSignedUrl('getObject', s3Params);

                        res.write((0, _stringify2.default)({ signedUrl: signedUrl, fileName: req.params.fileName }));
                        res.end();

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}());

// Get signature for delete
router.get('/delete/:fileName', authServices.confirmUserCredentials, function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var s3, key, s3Params;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        s3 = new aws.S3(s3InitConfig), key = req.params.username + '/' + req.params.subTitle + '/' + req.params.fileName, s3Params = { Bucket: process.env.S3_BUCKET, Key: key };

                        s3.deleteObject(s3Params, function (err, data) {
                            if (err) {
                                console.log(err, err.stack);
                            } else {
                                req.flash('success', 'File successfully deleted');
                                res.redirect('back');
                            }
                        });

                    case 2:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}());

module.exports = router;
//# sourceMappingURL=amazons3.js.map