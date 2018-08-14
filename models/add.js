var mongoose = require("mongoose");

var addSchema = new mongoose.Schema({
    file: {type: String, required: true},
    author: {type: String, required: true},
    date: {type: Date, default: Date.now},
    submission: {type: mongoose.Schema.Types.ObjectId, ref: "Submission"}
}, {
    usePushEach: true
});                  

module.exports = mongoose.model("Add", addSchema);