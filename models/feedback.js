var mongoose = require("mongoose");

var feedbackSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now},
    content: {type: String, required: true}
}, {
    usePushEach: true
});                  

module.exports = mongoose.model("Feedback", feedbackSchema);