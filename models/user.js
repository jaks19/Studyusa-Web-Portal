var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    balance: {type: Number, default: 1500.0},
    admin: {type: Boolean, default: false},
    submissions: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
        }
    ],
    payments: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
        }
    ],
    group : {type: String, default: 'noGroup'}, //group name
    messages : [
        {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
    ],
    notifs : [
        {type: mongoose.Schema.Types.ObjectId, ref: "Notif"}
    ]
}); 

userSchema.plugin(passportLocalMongoose); // Adds a bunch of methods usable on the dB for auth. Can bypass this lib and write our own fns (https://www.npmjs.com/package/passport)

module.exports = mongoose.model("User", userSchema);