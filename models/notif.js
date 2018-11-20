var mongoose = require("mongoose");

var notifSchema = new mongoose.Schema({
    causerName: {
        type: String, 
        required: true
        },
    objectName: { // Object which if rendered would show that item concerned. Object is a parent or itself.
        type: String, 
        required: true
    },
    event: {
        type: String, 
        required: true, 
        enum: ['comment', 'msg', 'msg-group', 'add', 'group-add', 'group-remove', 'pay']
    },
    seen: {
        type: Boolean,
        default: false,
        required: true
    },
    date : {
        type: Date,
        default: Date.now
    }
}, {
    usePushEach: true
});                  

module.exports = mongoose.model("Notif", notifSchema);


