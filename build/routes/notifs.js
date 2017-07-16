'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    notifServices = require('../services/notif-services'),
    dbopsServices = require('../services/dbops-services');

// Models
var Notif = require("../models/notif"),
    User = require("../models/user"),
    format = require('../notifJson');

// To be Exported
var router = express.Router({ mergeParams: true });

// View Notifs
router.get('/', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var foundUser, _notifServices$getBot, _notifServices$getBot2, unseenNotifs, seenNotifs;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, ['notifs'], req, res);

                    case 2:
                        foundUser = _context.sent;
                        _notifServices$getBot = notifServices.getBothSeenAndUnseenNotifs(foundUser.notifs);
                        _notifServices$getBot2 = (0, _slicedToArray3.default)(_notifServices$getBot, 2);
                        unseenNotifs = _notifServices$getBot2[0];
                        seenNotifs = _notifServices$getBot2[1];


                        res.render('notifs', {
                            user: foundUser,
                            loggedIn: true,
                            format: format,
                            unseenNotifs: unseenNotifs.reverse(),
                            seenNotifs: seenNotifs.reverse(),
                            client: foundUser
                        });

                    case 8:
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

// Notif Toggling seen-unseen
router.get('/:id/toggle', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var foundNotif;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(Notif, { '_id': req.params.id }, [], req, res);

                    case 2:
                        foundNotif = _context2.sent;

                        foundNotif.seen = !foundNotif.seen;
                        dbopsServices.savePopulatedEntry(foundNotif, req, res);
                        res.redirect('back');

                    case 6:
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

module.exports = router;
//# sourceMappingURL=notifs.js.map