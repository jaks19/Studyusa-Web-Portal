'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    notifServices = require('../services/notif-services'),
    dbopsServices = require('../services/dbops-services');

// Models
var User = require("../models/user"),
    Group = require("../models/group"),
    Message = require("../models/comment");

var router = express.Router({ mergeParams: true });

// Show Personal Messages
router.get('/personal/', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var client;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, ['messages'], req, res);

                    case 2:
                        client = _context.sent;

                        res.render('personalMessages', { user: client, loggedIn: true, client: client });

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

// Show Group Messages
router.get('/group/', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var foundClient, foundGroup;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

                    case 2:
                        foundClient = _context2.sent;
                        _context2.next = 5;
                        return dbopsServices.findOneEntryAndPopulate(Group, { 'name': foundClient.group }, ['messages', 'users'], req, res);

                    case 5:
                        foundGroup = _context2.sent;

                        res.render('groupMessages', { messages: foundGroup['messages'], loggedIn: true, user: foundClient, users: foundGroup.users, client: foundClient });

                    case 7:
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

// New Personal Message
router.post('/personal/', authServices.confirmUserCredentials, function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var foundClient, sender, newM, newMessage;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

                    case 2:
                        foundClient = _context3.sent;
                        sender = req.user;
                        newM = new Message({ username: sender.username, content: req.body.textareacontent });
                        _context3.next = 7;
                        return dbopsServices.createEntryAndSave(Message, newM, req, res);

                    case 7:
                        newMessage = _context3.sent;


                        foundClient.messages.push(newMessage);
                        dbopsServices.savePopulatedEntry(foundClient, req, res);
                        notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg', foundClient.username, req);
                        res.redirect('/index/' + foundClient.username + '/messages/personal');

                    case 12:
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

// New Group Message
router.post('/group/', authServices.confirmUserCredentials, function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var sender, oneClient, foundGroup, newM, newMessage;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        sender = req.user;
                        _context4.next = 3;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

                    case 3:
                        oneClient = _context4.sent;
                        _context4.next = 6;
                        return dbopsServices.findOneEntryAndPopulate(Group, { 'name': oneClient.group }, ['users'], req, res);

                    case 6:
                        foundGroup = _context4.sent;
                        newM = new Message({ username: sender.username, content: req.body.textareacontent });
                        _context4.next = 10;
                        return dbopsServices.createEntryAndSave(Message, newM, req, res);

                    case 10:
                        newMessage = _context4.sent;

                        foundGroup.messages.push(newMessage);
                        dbopsServices.savePopulatedEntry(foundGroup, req, res);
                        foundGroup.users.forEach(function (receiver) {
                            notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver.username, req);
                        });
                        res.redirect('back');

                    case 15:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}());

module.exports = router;
//# sourceMappingURL=messages.js.map