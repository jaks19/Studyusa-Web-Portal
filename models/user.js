var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    username: {type: String, index: true, unique: true},
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

// Index the db by the username because search by username often
// Gives search as fast as by _id since index is on _id by default
// (Both _id and username will be fast, this does not override)
// (Done in the schema itself, see username field)

module.exports = mongoose.model("User", userSchema);
