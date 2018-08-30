var mongoose = require("mongoose");

// Need to add the new object designed for files as File was deprecated for being a keyword
var taskSubscriberSchema = new mongoose.Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        unpublishedWorkspace: String,
        comments: [
            {type: mongoose.Schema.Types.ObjectId, ref: "Commentary"}
        ]
    }, {
        usePushEach: true
});

module.exports = mongoose.model("TaskSubscriber", taskSubscriberSchema);

// TODO: also, anything fetched from the DB that needs to be read-only needs to be LEANED i.e. qry.lean().exec();
