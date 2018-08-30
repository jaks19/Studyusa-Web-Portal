var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
        name: {type: String, required: true},
        username: {type: String, unique: true, required: true},
        password: String,
        admin: {type: Boolean, default: false, required: true},
        dateJoined: {type: Date, default: Date.now, required: true},
        lastLoggedIn: {type: Date, default: Date.now, required: true},
        group : {type: mongoose.Schema.Types.ObjectId, ref: "Group"},
        tasks: [{type: mongoose.Schema.Types.ObjectId, ref: "Task"}],

        // Rethink model when doing these:
        messages : [{ type: mongoose.Schema.Types.ObjectId, ref: "Commentary" }],
        notifs : [{ type: mongoose.Schema.Types.ObjectId, ref: "Notif" }],
    }, {
        usePushEach: true
    });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

// Testing TODO: Check salting of password
