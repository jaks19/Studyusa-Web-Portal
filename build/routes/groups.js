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
    groupServices = require('../services/group-services'),
    notifServices = require('../services/notif-services');

// Models
var Group = require("../models/group"),
    User = require("../models/user");

var router = express.Router({ mergeParams: true });

// Index
router.get('/', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var groups, freeUsers;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbopsServices.findAllEntriesAndPopulate(Group, {}, ['users'], req, res);

                    case 2:
                        groups = _context.sent;
                        _context.next = 5;
                        return dbopsServices.findAllEntriesAndPopulate(User, { 'group': 'noGroup' }, [], req, res);

                    case 5:
                        freeUsers = _context.sent;

                        res.render('./admin/groups', {
                            user: req.user,
                            freeUsers: freeUsers,
                            groups: groups,
                            loggedIn: true,
                            client: req.user
                        });

                    case 7:
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

// New Group
router.post('/', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var checkedUserIds, groupName, newGroupData, groupEntry, i, checkedUserEntry;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        checkedUserIds = groupServices.getCheckedUsers(req, res);
                        groupName = req.body.name;
                        newGroupData = new Group({ name: groupName });
                        _context2.next = 5;
                        return dbopsServices.createEntryAndSave(Group, newGroupData, req, res, false);

                    case 5:
                        groupEntry = _context2.sent;
                        i = 0;

                    case 7:
                        if (!(i < checkedUserIds.length)) {
                            _context2.next = 18;
                            break;
                        }

                        _context2.next = 10;
                        return dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [], req, res);

                    case 10:
                        checkedUserEntry = _context2.sent;

                        checkedUserEntry.group = groupName;
                        groupEntry.users.push(checkedUserEntry);
                        notifServices.assignNotification(req.user.username, groupName, 'group-add', checkedUserEntry.username, req);
                        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);

                    case 15:
                        i++;
                        _context2.next = 7;
                        break;

                    case 18:
                        dbopsServices.savePopulatedEntry(groupEntry, req, res);
                        res.redirect('back');

                    case 20:
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

// Add to Group
router.put('/:groupId', authServices.confirmUserCredentials, function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var checkedUserIds, foundGroup, i, checkedUserEntry;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        checkedUserIds = groupServices.getCheckedUsers(req, res);
                        _context3.next = 3;
                        return dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, ['users'], req, res);

                    case 3:
                        foundGroup = _context3.sent;
                        i = 0;

                    case 5:
                        if (!(i < checkedUserIds.length)) {
                            _context3.next = 16;
                            break;
                        }

                        _context3.next = 8;
                        return dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [], req, res);

                    case 8:
                        checkedUserEntry = _context3.sent;

                        checkedUserEntry.group = foundGroup.name;
                        foundGroup.users.push(checkedUserEntry);
                        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
                        notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req);

                    case 13:
                        i++;
                        _context3.next = 5;
                        break;

                    case 16:

                        dbopsServices.savePopulatedEntry(foundGroup, req, res);
                        res.redirect('back');

                    case 18:
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

// Remove someone from his/her group
router.get('/remove', authServices.confirmUserCredentials, function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var foundUser, foundGroup;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

                    case 2:
                        foundUser = _context4.sent;
                        _context4.next = 5;
                        return dbopsServices.findOneEntryAndPopulate(Group, { 'name': foundUser.group }, [], req, res);

                    case 5:
                        foundGroup = _context4.sent;

                        foundUser.group = 'noGroup';
                        dbopsServices.savePopulatedEntry(foundUser, req, res);
                        notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req);

                        if (!(foundGroup.users.length == 1)) {
                            _context4.next = 14;
                            break;
                        }

                        _context4.next = 12;
                        return dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res);

                    case 12:
                        _context4.next = 15;
                        break;

                    case 14:
                        foundGroup.users.pull(foundUser);

                    case 15:
                        dbopsServices.savePopulatedEntry(foundGroup, req, res);
                        res.redirect('back');

                    case 17:
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

// Delete a Group
router.delete('/:groupId', authServices.confirmUserCredentials, function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
        var foundGroup, foundUsers, i, thisUser;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(Group, { '_id': req.params.groupId }, [], req, res);

                    case 2:
                        foundGroup = _context5.sent;
                        _context5.next = 5;
                        return dbopsServices.findAllEntriesAndPopulate(User, { 'group': foundGroup.name }, [], req, res);

                    case 5:
                        foundUsers = _context5.sent;

                        for (i = 0; i < foundUsers.length; i++) {
                            thisUser = foundUsers[i];

                            thisUser.group = 'noGroup';
                            dbopsServices.savePopulatedEntry(thisUser, req, res);
                            notifServices.assignNotification(req.user.username, foundGroup.name, 'group-delete', thisUser.username, req);
                        }
                        _context5.next = 9;
                        return dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res);

                    case 9:
                        res.redirect('back');

                    case 10:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
    };
}());

module.exports = router;
//# sourceMappingURL=groups.js.map