// Packages
var express = require("express");
// Set secret Stripe key: remember to change this your live secret key in production
// My keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require("stripe")("sk_test_2uZMhxT39A3xJsZSKtGNC9rX");

// Models
var User = require("../models/user"),
    Payment = require("../models/payment"),
    middleware = require('../middleware'),
    helpers = require('../helpers');

// To be Exported
var router = express.Router(); // To allow linking routing from this file to router (For cleaner code)

// New Payment - GET
router.get('/', middleware.isLoggedIn, function(req, res) {
    var username = req.user.username;
    User.findOne({
        'username': username
    }).populate('payments').populate('submissions').exec(function(error, foundUser) {
        if (!error) {
            res.render('pay', {
                user: foundUser,
                loggedIn: true,
                headerUser: 'pay',
                client: foundUser,
                viewer: req.user
            });
        }
    });
});

// New Payment - POST
router.post('/', middleware.isLoggedIn, function(req, res) { //IMPORTANT: normally you would use a post request to an index page but I already have one POST req going there for Users
    // Actions chain so do most prone to fail first (process money)
    // Get the credit card details submitted by the form
    var token = req.body.stripeToken; // Using Express
    // Create a charge: this will charge the user's card
    stripe.charges.create({
        amount: req.body.amount * 100, // Amount in cents
        currency: "usd",
        source: token,
        description: req.body.purpose
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
        }
        else {
            req.flash('success', 'Card successfully charged! Thank you!');
            // Successfully charged card! - update dbs
            // Takes in form data and updates DB
            var username = req.user.username;
            User.findOne({
                'username': username
            }, function(error, foundUser) {
                if (error) {
                    req.flash('error', 'Could not locate your user record at this time!');
                }
                else {
                    Payment.create({
                            user: foundUser,
                            amount: req.body.amount,
                            purpose: req.body.purpose,
                            billingAddress: req.body.street + ' ' + req.body.apt + ' ' + req.body.city + ' ' + req.body.state + ' ' + req.body.zip + ' ' + req.body.country,
                            merchant: 'Stripe',
                            merchantTransactionId: charge.id
                        },
                        function(error, newPayment) {
                            if (error) {
                                req.flash('error', 'An entry not created in your Payment History!');
                            }
                            else {
                                foundUser.payments.push(newPayment);
                                foundUser.balance -= req.body.amount;
                                foundUser.save(function(error, data) {
                                    if (error) {
                                        req.flash('error', 'The payment was not saved in your user records!');
                                    }
                                    else {
                                        helpers.assignNotif(foundUser.username, newPayment.purpose, 'pay', 'admin');
                                        res.redirect('/index/' + username + '/pay');
                                    }
                                });
                            }
                        });
                }
            });
        }
    });
});

module.exports = router;
