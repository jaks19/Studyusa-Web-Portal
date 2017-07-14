let paymentServices = {};

// Set secret Stripe key: remember to change this your live secret key in production
// My keys here: https://dashboard.stripe.com/account/apikeys
let stripe = require("stripe")("sk_test_2uZMhxT39A3xJsZSKtGNC9rX");


function promiseToCreateStripeCharge(amount, token, purpose) {
  return new Promise(function (resolve, reject) {
     stripe.charges.create({ 
        amount: amount * 100,
        currency: "usd",
        source: token,
        description: purpose
      }, function(err, charge) {
          if (err) { reject(err) }
          else { resolve(charge) }
      });
  });
}

paymentServices.createStripeCharge = async function createStripeCharge(amount, token, purpose, req, res) {
  var charge;
  try { charge = await promiseToCreateStripeCharge(amount, token, purpose) }
  catch(error) { 
    req.flash('error', 'error processing payment');
    res.redirect('back');
    return;
  }
  return charge;
}
    
paymentServices.gatherPaymentData = function gatherPaymentData(foundUser, req, charge) { 
  let paymentData = {};
  paymentData.user = foundUser,
  paymentData.amount = req.body.amount,
  paymentData.purpose = req.body.purpose,
  paymentData.billingAddress = req.body.street + ' ' + req.body.apt + ' ' + req.body.city + ' ' + req.body.state + ' ' + req.body.zip + ' ' + req.body.country,
  paymentData.merchant = 'Stripe',
  paymentData.merchantTransactionId = charge.id;
  return paymentData;
}

module.exports = paymentServices;