"use strict";

var mongoose = require("mongoose");

var groupSchema = new mongoose.Schema({
    name: String,
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Group", groupSchema);
//# sourceMappingURL=group.js.map