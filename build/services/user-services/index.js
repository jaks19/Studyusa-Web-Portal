'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userServices = {};
var User = require("../../models/user"),
    notifServices = require('../notif-services'),
    dbOpsServices = require('../dbops-services'),
    apiServices = require('../api-services');

userServices.getUserData = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(username, req, res) {
        var userData;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        userData = {};
                        _context.next = 3;
                        return dbOpsServices.findOneEntryAndPopulate(User, { 'username': username }, ['submissions', 'notifs'], req, res);

                    case 3:
                        userData.populatedUser = _context.sent;
                        userData.allNotifs = userData.populatedUser.notifs.reverse();
                        userData.unseenNotifs = notifServices.getUnseenNotifs(userData.populatedUser.notifs);
                        userData.firstContact = req.query.welcome ? true : false;

                        if (!userData.populatedUser.admin) {
                            _context.next = 13;
                            break;
                        }

                        _context.next = 10;
                        return dbOpsServices.findAllEntriesAndPopulate(User, {}, [], req, res);

                    case 10:
                        userData.users = _context.sent;
                        _context.next = 17;
                        break;

                    case 13:
                        _context.next = 15;
                        return apiServices.retrieveNews(req);

                    case 15:
                        userData.articles = _context.sent;
                        userData.subs = userData.populatedUser.submissions.reverse();

                    case 17:
                        return _context.abrupt('return', userData);

                    case 18:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    function getUserData(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    }

    return getUserData;
}();

module.exports = userServices;
//# sourceMappingURL=index.js.map