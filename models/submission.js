var mongoose = require("mongoose");

var submissionSchema = new mongoose.Schema({
    title: {type: String, required: true},
    adds: [
        {type: mongoose.Schema.Types.ObjectId, ref: "Add"}
            ],
    folder: {type: String},
    messages: [
                {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
            ],
    date: {type: Date, default: Date.now},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});                  

module.exports = mongoose.model("Submission", submissionSchema);