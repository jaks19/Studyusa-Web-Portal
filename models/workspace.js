const mongoose = require("mongoose");

// Does not have any nested document, as only way to reach it is to use a wrapper document,
// ( example a task )
// Wil have Strings for easy access to metadata
var workspaceSchema = new mongoose.Schema({
        published: {type: Boolean, required: true, default: false},
        // Example in a task, an author has submission 1,2,3,etc...
        number: {type: Number, required: true},
        // Should not be published until locked is made false
        lockedForPublishing: {type: Boolean, required: true, default: false},
        // If unpublished, has content, else content is removed and posted as a file on aws
        content: String,
        // Metadata to get path of file on aws concernedStudentName/taskName/submission+number or response+number if counselor
        // Store under concernedStudentName to retrieve easily
        concernedStudentName: {type: String, required: true},
        taskName: {type: String, required: true},
        // Can be same or different from concernedStudentName
        authorName: {type: String, required: true},
        // Text added when publishing
        authorMemo: String,
        datePublished: Date,
        dateEdited: Date
    });

module.exports = mongoose.model("Workspace", workspaceSchema);
