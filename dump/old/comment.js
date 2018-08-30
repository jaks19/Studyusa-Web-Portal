// Task feedback, messages, all take from this model
// Recipients etc to be used or not based on the app using this model

var mongoose = require("mongoose");

var commentarySchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now},
    content: {type: String, required: true}
}, {
    usePushEach: true
});

module.exports = mongoose.model("Comment", commentarySchema);
