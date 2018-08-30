var mongoose = require("mongoose");

// Populating nested documents made easier
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// Need to add the new object designed for files as File was deprecated for being a keyword
var taskSubscriberSchema = new mongoose.Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        unpublishedWorkspace: String,
        comments: [
            {type: mongoose.Schema.Types.ObjectId, ref: "Commentary"}
        ]
    }, {
        usePushEach: true
});

taskSubscriberSchema.plugin(deepPopulate, {});

module.exports = mongoose.model("TaskSubscriber", taskSubscriberSchema);

// TODO: also, anything fetched from the DB that needs to be read-only needs to be LEANED i.e. qry.lean().exec();
