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

// Index the db by the combination of task (id) and user (id) so that seaching for a taskSubscriber
// with the requirements being a combination of taskId and userId will be as fast as searching by
// the taskSubscriberId. TODO: same thing with user.username
// Note how a pair of taskId and userId is unique among other pairs in this collection
taskSubscriberSchema.index({task: 1, user: 1}, {unique: true});

module.exports = mongoose.model("TaskSubscriber", taskSubscriberSchema);

// Note:
// Adding ref to another document is just an id UNTIL YOU POPULATE
// Adding Task or User to this schema i.e. a nested document is NOT equivalent to just repeating stuff again and again
// If these are never populated, they can just serve as ids that we can search against
// That is why here we use task and user as searching for a combination of task and user leads us to the exact unique taskSubscriber document

// TODO: find out if we ever populate an object say a message inside a task, just to grab its id and do something with it, because we DO NOT NEED TO POPULATE
// TODO: also, anything fetched from the DB that needs to be read-only needs to be LEANED i.e. qry.lean().exec();
