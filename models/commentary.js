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


// Too deep to populate users' tasks then task comments then comment Author, so use a pre for now until update mongoose

var autoPopulateLead = function(next) {
  this.populate('author');
  this.populate('recipient');
  next();
};

commentarySchema.
  pre('findOne', autoPopulateLead).
  pre('find', autoPopulateLead);



module.exports = mongoose.model("Commentary", commentarySchema);
