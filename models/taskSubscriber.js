var mongoose = require("mongoose");
// Populating nested documents made easier
// var deepPopulate = require('mongoose-deep-populate')(mongoose);

// Need to add the new object designed for files as File was deprecated for being a keyword
var taskSubscriberSchema = new mongoose.Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        unpublishedWorkspace: {type: String},
        comments: [
            {type: mongoose.Schema.Types.ObjectId, ref: "Commentary"}
        ]
    }, {
        usePushEach: true
});

module.exports = mongoose.model("TaskSubscriber", taskSubscriberSchema);
