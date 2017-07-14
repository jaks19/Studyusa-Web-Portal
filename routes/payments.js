// Packages
var express = require("express");

// Models
var User = require("../models/user"),
    Payment = require("../models/payment"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    paymentServices = require('../services/payment-services'),
    notifServices = require('../services/notif-services'),
    helpers = require('../helpers');

// To be Exported
var router = express.Router({
    mergeParams: true
});

// New Payment - GET
router.get('/', authServices.confirmUserCredentials, async function(req, res) {
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.user.username }, [ 'payments', 'submissions' ], req, res);
    res.render('pay', {
        user: req.user,
        loggedIn: true,
        headerUser: 'pay',
        client: foundUser
    });
});

// New Payment - POST
router.post('/', authServices.confirmUserCredentials, async function(req, res) { 
    let username = req.user.username,
        charge = await paymentServices.createStripeCharge(req.body.amount, req.body.stripeToken, req.body.purpose, req, res);
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': username }, [ ], req, res),
        newPaymentData = paymentServices.gatherPaymentData(foundUser, req, charge),
        newPayment = await dbopsServices.createEntryAndSave(Payment, newPaymentData, req, res);
    foundUser.payments.push(newPayment);
    foundUser.balance -= req.body.amount;
    dbopsServices.savePopulatedEntry(foundUser, req, res);
    notifServices.assignNotification(req.user.username, newPayment.purpose, 'pay', req.params.username, req);
    req.flash('success', 'Card successfully charged! Thank you!');
    res.redirect('/index/' + username + '/pay');
});

module.exports = router;
