"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Packages
var express = require("express");

// Models
var User = require("../models/user"),
    Payment = require("../models/payment"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    paymentServices = require('../services/payment-services'),
    notifServices = require('../services/notif-services');

// To be Exported
var router = express.Router({
    mergeParams: true
});

// New Payment - GET
router.get('/', authServices.confirmUserCredentials, function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var foundUser;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': req.user.username }, ['payments', 'submissions'], req, res);

                    case 2:
                        foundUser = _context.sent;

                        res.render('pay', {
                            user: req.user,
                            loggedIn: true,
                            headerUser: 'pay',
                            client: foundUser
                        });

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

// New Payment - POST
router.post('/', authServices.confirmUserCredentials, function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var username, charge, foundUser, newPaymentData, newPayment;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        username = req.user.username;
                        _context2.next = 3;
                        return paymentServices.createStripeCharge(req.body.amount, req.body.stripeToken, req.body.purpose, req, res);

                    case 3:
                        charge = _context2.sent;
                        _context2.next = 6;
                        return dbopsServices.findOneEntryAndPopulate(User, { 'username': username }, [], req, res);

                    case 6:
                        foundUser = _context2.sent;
                        newPaymentData = paymentServices.gatherPaymentData(foundUser, req, charge);
                        _context2.next = 10;
                        return dbopsServices.createEntryAndSave(Payment, newPaymentData, req, res);

                    case 10:
                        newPayment = _context2.sent;

                        foundUser.payments.push(newPayment);
                        foundUser.balance -= req.body.amount;
                        dbopsServices.savePopulatedEntry(foundUser, req, res);
                        notifServices.assignNotification(req.user.username, newPayment.purpose, 'pay', req.params.username, req);
                        req.flash('success', 'Card successfully charged! Thank you!');
                        res.redirect('/index/' + username + '/pay');

                    case 17:
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

module.exports = router;
//# sourceMappingURL=payments.js.map