var mongoose = require("mongoose");

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

//  Questions fr finalizing mongo:
// 1  Populating when item nested in an object?
