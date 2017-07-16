"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var paymentServices = {};

// Set secret Stripe key: remember to change this your live secret key in production
// My keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require("stripe")(process.env.stripeSecret);

function promiseToCreateStripeCharge(amount, token, purpose) {
  return new _promise2.default(function (resolve, reject) {
    stripe.charges.create({
      amount: amount * 100,
      currency: "usd",
      source: token,
      description: purpose
    }, function (err, charge) {
      if (err) {
        reject(err);
      } else {
        resolve(charge);
      }
    });
  });
}

paymentServices.createStripeCharge = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(amount, token, purpose, req, res) {
    var charge;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return promiseToCreateStripeCharge(amount, token, purpose);

          case 3:
            charge = _context.sent;
            _context.next = 11;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);

            req.flash('error', 'error processing payment');
            res.redirect('back');
            return _context.abrupt("return");

          case 11:
            return _context.abrupt("return", charge);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 6]]);
  }));

  function createStripeCharge(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  }

  return createStripeCharge;
}();

paymentServices.gatherPaymentData = function gatherPaymentData(foundUser, req, charge) {
  var paymentData = {};
  paymentData.user = foundUser, paymentData.amount = req.body.amount, paymentData.purpose = req.body.purpose, paymentData.billingAddress = req.body.street + ' ' + req.body.apt + ' ' + req.body.city + ' ' + req.body.state + ' ' + req.body.zip + ' ' + req.body.country, paymentData.merchant = 'Stripe', paymentData.merchantTransactionId = charge.id;
  return paymentData;
};

module.exports = paymentServices;
//# sourceMappingURL=index.js.map