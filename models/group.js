var mongoose = require("mongoose");

var groupSchema = new mongoose.Schema({
        name: {type: String, required: true, unique: true},
        dateCreated: {type: Date, default: Date.now, required: true},
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        messages : [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
    }, {
        usePushEach: true
    });

module.exports = mongoose.model("Group", groupSchema);
