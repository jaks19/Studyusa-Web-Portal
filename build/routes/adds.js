"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// An 'Add' is a file submitted to elongate a submission thread

// Packages
var express = require("express"),
    fs = require("fs"),
    // To read-from/write-to files
authServices = require('../services/auth-services'),
    filesystemServices = require('../services/filesystem-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services');

// Models
var Submission = require("../models/submission"),
    Add = require("../models/add");

var router = express.Router({
    mergeParams: true
});

// Download file (Get add)
router.get('/:addId', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var foundAdd;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(Add, { '_id': req.params.addId }, ['submission'], req, res);

                    case 2:
                        foundAdd = _context.sent;

                        res.download(filesystemServices.getExistingFilePath(foundAdd, req));

                    case 4:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

// Delete File (Delete add)
router.delete('/:addId', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var username, foundAdd, foundSub, fileName;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        username = req.params.username;
                        _context2.next = 3;
                        return dbopsServices.findOneEntryAndPopulate(Add, { '_id': req.params.addId }, ['submission'], req, res);

                    case 3:
                        foundAdd = _context2.sent;
                        foundSub = foundAdd.submission;
                        fileName = foundAdd.file;
                        _context2.next = 8;
                        return dbopsServices.findEntryByIdAndRemove(Add, foundAdd._id, req, res);

                    case 8:
                        res.redirect('/index/' + username + '/submit/' + foundSub._id + '/s3/' + foundSub.title + '/delete/' + fileName);

                    case 9:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}());

// New Update file to a thread
router.post('/', authServices.confirmUserCredentials, function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var username, foundSub, fileName, newAddData, newAdd;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        username = req.params.username;
                        _context3.next = 3;
                        return dbopsServices.findOneEntryAndPopulate(Submission, { '_id': req.params.id }, ['user'], req, res);

                    case 3:
                        foundSub = _context3.sent;
                        _context3.next = 6;
                        return filesystemServices.getAddedFileName(req, res);

                    case 6:
                        fileName = _context3.sent;
                        newAddData = new Add({ file: fileName, author: req.user.username, submission: foundSub });
                        _context3.next = 10;
                        return dbopsServices.createEntryAndSave(Add, newAddData, req, res);

                    case 10:
                        newAdd = _context3.sent;


                        foundSub.adds.push(newAdd);
                        dbopsServices.savePopulatedEntry(foundSub, req, res);
                        notifServices.assignNotification(req.user.username, foundSub.title, 'add', foundSub.user.username, req);
                        req.flash('success', 'file successfully uploaded for review');
                        res.redirect('/index/' + username + '/submit/' + foundSub._id);

                    case 16:
                    case "end":
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
//# sourceMappingURL=adds.js.map