'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Packages
var express = require("express"),
    path = require('path'),
    format = require('../notifJson');

// Services
var userServices = require('../services/user-services'),
    authServices = require('../services/auth-services'),
    filesystemServices = require('../services/filesystem-services');

// Models
var User = require("../models/user");

var router = express.Router({ mergeParams: true });

// New User Page
router.get('/new', function (req, res) {
    res.render('new', {
        loggedIn: false
    });
});

// New User Signup
router.post('/', function (req, res) {
    var newUserObject = new User({ name: req.body.name, username: req.body.username });
    User.register(newUserObject, req.body.password, function () {
        return;
    });
    res.redirect('/login');
});

// Admin Dashboard
router.get('/admin', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var username, adminData;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        username = req.user.username;
                        _context.next = 3;
                        return userServices.getUserData(username, req, res);

                    case 3:
                        adminData = _context.sent;

                        res.render('./admin/dashboard', {
                            user: adminData.populatedUser,
                            users: adminData.users,
                            client: adminData.populatedUser,
                            notifs: adminData.allNotifs,
                            unseenNotifs: adminData.unseenNotifs,
                            format: format,
                            firstContact: adminData.firstContact,
                            loggedIn: true
                        });

                    case 5:
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

// User Dashboard
router.get('/:username', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var username, userData;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        username = req.params.username;
                        _context2.next = 3;
                        return userServices.getUserData(username, req, res);

                    case 3:
                        userData = _context2.sent;

                        res.render('show', {
                            user: req.user,
                            client: userData.populatedUser,
                            notifs: userData.allNotifs,
                            unseenNotifs: userData.unseenNotifs,
                            format: format,
                            firstContact: userData.firstContact,
                            subs: userData.subs,
                            articles: userData.articles,
                            loggedIn: true
                        });

                    case 5:
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

// Delete
router.delete('/:username', authServices.confirmUserCredentials, function (req, res) {
    User.findOneAndRemove({ 'username': req.params.username }, function (error) {
        if (error) {
            req.flash('error', 'The user account could not be deleted!');
            return res.redirect('back');
        } else {
            req.flash('success', 'The user account was successfully deleted! Ciao to the user! ;)');
            return res.redirect('/index/' + req.user.username);
        }
    });
});

module.exports = router;
//# sourceMappingURL=users.js.map