// Task feedback, messages, all take from this model
// Recipients etc to be used or not based on the app using this model

var mongoose = require("mongoose");

var commentarySchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now},
    content: {type: String, required: true}
}, {
    usePushEach: true
});


// Always want author and recipient when dealing with a comment

let autoPopulateLead = function(next) {
  this.populate('author');
  this.populate('recipient');
  next();
};

commentarySchema.
  pre('findOne', autoPopulateLead).
  pre('find', autoPopulateLead);

module.exports = mongoose.model("Commentary", commentarySchema);
