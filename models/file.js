var mongoose = require("mongoose");

var fileSchema = new mongoose.Schema({
    file: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now},
    task: {type: mongoose.Schema.Types.ObjectId, ref: "Task"}
}, {
    usePushEach: true
});                  

module.exports = mongoose.model("File", fileSchema);