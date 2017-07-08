var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    username: {type: String, required: true},
    date: {type: Date, default: Date.now},
    content: {type: String, required: true}
});                  

module.exports = mongoose.model("Comment", commentSchema);