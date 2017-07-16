'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A 'Comment' is added to a submission to keep track of the thread
// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services');

// Models
var Submission = require("../models/submission"),
    Comment = require("../models/comment");

var router = express.Router({ mergeParams: true });

// New Comment
router.post('/', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var subId, content, foundSub, newC, newComment;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        subId = req.params.id;
                        content = req.body.textareacontent;
                        _context.next = 4;
                        return dbopsServices.findOneEntryAndPopulate(Submission, { '_id': subId }, ['user'], req, res);

                    case 4:
                        foundSub = _context.sent;
                        newC = new Comment({ username: req.user.username, content: content });
                        _context.next = 8;
                        return dbopsServices.createEntryAndSave(Comment, newC, req, res);

                    case 8:
                        newComment = _context.sent;

                        foundSub.messages.push(newComment);
                        dbopsServices.savePopulatedEntry(foundSub, req, res);
                        notifServices.assignNotification(req.user.username, foundSub.title, 'comment', req.params.username, req);
                        res.redirect('/index/' + foundSub.user.username + '/submit/' + foundSub._id);

                    case 13:
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

// Edit Comment
router.put('/:commentId/', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var newText, foundComment;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        newText = req.body.newText;
                        _context2.next = 3;
                        return dbopsServices.findOneEntryAndPopulate(Comment, { '_id': req.params.commentId }, [], req, res);

                    case 3:
                        foundComment = _context2.sent;

                        foundComment.content = newText;
                        dbopsServices.savePopulatedEntry(foundComment, req, res);
                        req.flash('success', 'Comment successfully changed');
                        res.redirect('back');

                    case 8:
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

// Delete Comment
router.delete('/:commentId/', authServices.confirmUserCredentials, function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return dbopsServices.findEntryByIdAndRemove(Comment, req.params.commentId, req, res);

                    case 2:
                        res.redirect('back');

                    case 3:
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
//# sourceMappingURL=comments.js.map