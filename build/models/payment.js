"use strict";

var mongoose = require("mongoose");

var paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    date: { type: Date, default: Date.now },
    billingAddress: { type: String, required: true },
    merchant: { type: String, default: 'Stripe', required: true }, // TODO: Make this field restricted to our partner payment apis
    merchantTransactionId: { type: String, required: true, default: 'aaaaaa' // TODO: Collect the real transaction ID!
    } });

module.exports = mongoose.model("Payment", paymentSchema);
//# sourceMappingURL=payment.js.map