var mongoose = require("mongoose");

// Populating nested documents made easier
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    prompt: String,
    dateCreated: {type: Date, default: Date.now, required: true},
    dateEdited: {type: Date, default: Date.now},
    useLock: {type: Boolean, required: true, default: false},
    taskSubscribers: [ {type: mongoose.Schema.Types.ObjectId, ref: "TaskSubscriber"} ],
    archivedTaskSubscribers: [ {type: mongoose.Schema.Types.ObjectId, ref: "TaskSubscriber"} ]
}, {
    usePushEach: true
});

taskSchema.plugin(deepPopulate, {});

module.exports = mongoose.model("Task", taskSchema);
