'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    filesystemServices = require('../services/filesystem-services'),
    notifServices = require('../services/notif-services');

// Models
var User = require("../models/user"),
    Submission = require("../models/submission"),
    Comment = require("../models/comment"),
    Add = require("../models/add");

var router = express.Router({ mergeParams: true });

// New Submission
router.get('/', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var foundUser;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, ['submissions'], req, res);

                    case 2:
                        foundUser = _context.sent;

                        res.render('submit', {
                            loggedIn: true,
                            user: req.user,
                            client: foundUser
                        });

                    case 4:
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

// New Submission
router.post('/', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var fileData, newSubData, newSubmission, foundUser, newAddData, newAdd, newCommentData, newComment;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return filesystemServices.getNewFileMetadata(req, res);

                    case 2:
                        fileData = _context2.sent;
                        newSubData = new Submission({ title: fileData.title });
                        _context2.next = 6;
                        return dbopsServices.createEntryAndSave(Submission, newSubData, req, res, false);

                    case 6:
                        newSubmission = _context2.sent;
                        _context2.next = 9;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

                    case 9:
                        foundUser = _context2.sent;
                        newAddData = new Add({ file: fileData.fileName, author: foundUser.username, submission: newSubmission });
                        _context2.next = 13;
                        return dbopsServices.createEntryAndSave(Add, newAddData, req, res);

                    case 13:
                        newAdd = _context2.sent;
                        newCommentData = new Comment({ username: req.user.username, content: fileData.message });
                        _context2.next = 17;
                        return dbopsServices.createEntryAndSave(Comment, newCommentData, req, res);

                    case 17:
                        newComment = _context2.sent;


                        newSubmission.user = foundUser;
                        newSubmission.messages.push(newComment);
                        newSubmission.adds.push(newAdd);
                        dbopsServices.savePopulatedEntry(newSubmission, req, res);
                        foundUser.submissions.push(newSubmission);
                        dbopsServices.savePopulatedEntry(foundUser, req, res);
                        notifServices.assignNotification(req.user.username, newSubData.title, 'add', req.params.username, req);
                        res.redirect('/index/' + req.params.username);

                    case 26:
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

// Show Submission
router.get('/:id', authServices.confirmUserCredentials, function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var foundSub;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(Submission, { '_id': req.params.id }, ['user', 'messages', 'adds'], req, res);

                    case 2:
                        foundSub = _context3.sent;

                        res.render('viewFile', {
                            sub: foundSub,
                            user: req.user,
                            client: foundSub.user,
                            loggedIn: true
                        });

                    case 4:
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
//# sourceMappingURL=submissions.js.map