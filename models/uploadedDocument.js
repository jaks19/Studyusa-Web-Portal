var mongoose = require("mongoose");

// Only used in the front end to get a file without going to the server to

var uploadedDocumentSchema = new mongoose.Schema({
    documentName: {type: String, required: true},
    authorName: {type: String, required: true},
    dateSubmitted: {type: Date, default: Date.now, required: true},
    fileDescription: {type: String, required: true},
    s3Path: {type: String, required: true}
}, {
    usePushEach: true
});

module.exports = mongoose.model("UploadedDocument", uploadedDocumentSchema);
