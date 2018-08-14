var mongoose = require("mongoose");

var groupSchema = new mongoose.Schema({
    name: String,
    users: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        }
    ],
    messages : [
        {type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
    ]
}, {
    usePushEach: true
}); 

module.exports = mongoose.model("Group", groupSchema);