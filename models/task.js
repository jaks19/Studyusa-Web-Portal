var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    prompt: {type: String, required: true},
    dateCreated: {type: Date, default: Date.now},
    dateEdited: {type: Date, default: Date.now},
    files: [
        {type: mongoose.Schema.Types.ObjectId, ref: "File"}
            ],
    comments: [
        {type: mongoose.Schema.Types.ObjectId, ref: "Commentary"}
            ],
    users: [
                {type: mongoose.Schema.Types.ObjectId, ref: "User"}
            ]
}, {
    usePushEach: true
});

module.exports = mongoose.model("Task", taskSchema);

//  Questions fr finalizing mongo:
// 1  Populating when item nested in an object?
