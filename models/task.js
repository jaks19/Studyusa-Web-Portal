var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    prompt: {type: String, required: true},
    date: {type: Date, default: Date.now},
    files: [
        {type: mongoose.Schema.Types.ObjectId, ref: "File"}
            ],
    comments: [
                {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
            ],
    users: [
                {type: mongoose.Schema.Types.ObjectId, ref: "User"}
            ]
}, {
    usePushEach: true
});

module.exports = mongoose.model("Task", taskSchema);
