const mongoose = require("mongoose");

// Populating nested documents made easier
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// Need to add the new object designed for files as File was deprecated for being a keyword
var taskSubscriberSchema = new mongoose.Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        task: {type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true},
        unpublishedWorkspaceCounselor: {type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true},
        // If task has useLock true, then need to lock this workspace up and until counselor publishes their workspace
        unpublishedWorkspaceStudent: {type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true},
        lastPublishedWorkspaceCounselor: {type: mongoose.Schema.Types.ObjectId, ref: "Workspace"},
        lastPublishedWorkspaceStudent: {type: mongoose.Schema.Types.ObjectId, ref: "Workspace"},
        comments: [ {type: mongoose.Schema.Types.ObjectId, ref: "Commentary"} ],
        documents: [ {type: mongoose.Schema.Types.ObjectId, ref: "UploadedDocument"} ]
    }, {
        usePushEach: true
});

taskSubscriberSchema.index({task: 1, user: 1}, {unique: true});

taskSubscriberSchema.plugin(deepPopulate, {});

module.exports = mongoose.model("TaskSubscriber", taskSubscriberSchema);

// TODO: also, anything fetched from the DB that needs to be read-only needs to be LEANED i.e. qry.lean().exec();
