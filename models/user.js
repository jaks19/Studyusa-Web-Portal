var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    admin: {type: Boolean, default: false},
    dateJoined: {type: Date, default: Date.now},
    lastLoggedIn: {type: Date, default: Date.now},
    group : {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
    // Rethink model when doing these:
    messages : [
        {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
    ],
    notifs : [
        {type: mongoose.Schema.Types.ObjectId, ref: "Notif"}
    ]
}, {
    usePushEach: true
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
