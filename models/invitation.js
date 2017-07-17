var mongoose = require("mongoose");

var invitationSchema = new mongoose.Schema({
    code: {type: String, required: true},
    validUntil: {type: Date, required: true},
    nickname: {type: String, required: true}
});                  

module.exports = mongoose.model("Invitation", invitationSchema);