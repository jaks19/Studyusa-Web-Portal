const dbopsServices = require('../services/dbops-services');
const formServices = require('../services/form-services');

const Workspace = require('../models/workspace');
const TaskSubscriber = require('../models/taskSubscriber');
const Task = require('../models/task');
const User = require('../models/user');
const UploadedDocument = require('../models/uploadedDocument');

const constants = require('../config/constants')

let taskSubscriberServices = {};

taskSubscriberServices.getFirstEverWorkspaces = async function getFirstEverWorkspaces (task, counselorDoc, studentDoc) {

    let defaultContentCounselor = ' ';
    let defaultContentStudent = ' ';

    let counselorWorkspace = new Workspace({
        number: 1,
        content: defaultContentCounselor,
        concernedStudentName: studentDoc.username,
        taskName: task.title,
        authorName: counselorDoc.username,
    });

    // Starts unlocked then need to toggle each time they subscribe and when counselor responds after they submitted
    let studentWorkspace = new Workspace({
        number: 1,
        content: defaultContentStudent,
        concernedStudentName: studentDoc.username,
        taskName: task.title,
        authorName: studentDoc.username
    });

    await dbopsServices.savePopulatedEntry(counselorWorkspace);
    await dbopsServices.savePopulatedEntry(studentWorkspace);

    return [  counselorWorkspace, studentWorkspace ];
}


taskSubscriberServices.theCommentIsStillEditable =
    function theCommentIsStillEditable (user, comment, editableTimeIntervalInMinutes) {
        let weAreWithinEditableTime = new Date(comment.date) >
            (Date.now() - (editableTimeIntervalInMinutes*60*1000));

        let itIsThisUsersComment =
            String(comment.author._id) === String(user._id);

        if (user.admin || weAreWithinEditableTime){
            if (itIsThisUsersComment) {
                return true;
            }
        }

        return false;
}


// When a user is deleted, remove
taskSubscriberServices.unlinkUserFromTask =
    async function unlinkUserFromTask (userToDelete) {

        // Find tasksubscribers first then corresponding task directly (they are indexed by user and task)
        // Instead of looping all tasks, then each task's whole array of TaskSubscribers O(n^2)
        let allConcernedTasksSubscriberDocs = await dbopsServices.findAllEntriesAndPopulate(TaskSubscriber,
            { 'user': userToDelete._id }, [ 'task' ], true);

        for (const taskSubscriberDoc of allConcernedTasksSubscriberDocs) {
            let correspondingTask = await dbopsServices.findOneEntryAndPopulate(Task,
                { '_id': taskSubscriberDoc.task._id }, [ 'taskSubscribers', 'archivedTaskSubscribers' ], false);

            let cleanedTask = await cleanTaskListOfTaskSubscribersAndArchivedTaskSubscribers(correspondingTask, taskSubscriberDoc);
            await dbopsServices.savePopulatedEntry(cleanedTask);
        }

        return;

}

cleanTaskListOfTaskSubscribersAndArchivedTaskSubscribers = function(taskToClean, taskSubscriberDocToRemove) {
    // Filter task's TaskSubscribers
    taskToClean.taskSubscribers = taskToClean.taskSubscribers.filter( (taskSub) => {
        return !(String(taskSub._id) === String(taskSubscriberDocToRemove._id));
    });

    // Filter task's ArchivedTaskSubscribers
    taskToClean.archivedTaskSubscribers = taskToClean.archivedTaskSubscribers.filter( (archTaskSub) => {
        return !(String(archTaskSub._id) === String(taskSubscriberDocToRemove._id));
    });

    return taskToClean;
}


// This taskSubscriber has an unpublished workspace for both the counselor and student
// Also a published workspace for each one of them
// Get the string identifiers for each one of them so they can be fetched from the taskSubscriber object at higher level
// The object holds workspace names with general terms (currentUser... compositeUser...)
taskSubscriberServices.getAllWorkspaceNames = function getAllWorkspaceNames (req) {

        let allWorkspaceNames = {}

        if (req.user.admin) {
            allWorkspaceNames['currentUserUnpublishedWorkspace'] = 'unpublishedWorkspaceCounselor';
            allWorkspaceNames['currentUserPublishedWorkspace'] = 'lastPublishedWorkspaceCounselor';

            allWorkspaceNames['compositeUserUnpublishedWorkspace'] = 'unpublishedWorkspaceStudent';
            allWorkspaceNames['compositeUserPublishedWorkspace'] = 'lastPublishedWorkspaceStudent';

        }
        else {
            allWorkspaceNames['currentUserUnpublishedWorkspace'] = 'unpublishedWorkspaceStudent';
            allWorkspaceNames['currentUserPublishedWorkspace'] = 'lastPublishedWorkspaceStudent';

            allWorkspaceNames['compositeUserUnpublishedWorkspace'] = 'unpublishedWorkspaceCounselor';
            allWorkspaceNames['compositeUserPublishedWorkspace'] = 'lastPublishedWorkspaceCounselor';
        }

        return allWorkspaceNames;
}


taskSubscriberServices.produceTheNextWorkspaceForThisUser =
    async function produceTheNextWorkspaceForThisUser (theWorkspaceAboutToBePublished) {

        // Only advance the number by 1
        let nextWorkspaceForThisUser = new Workspace({
            number: theWorkspaceAboutToBePublished.number + 1,
            content: ' ',
            concernedStudentName: theWorkspaceAboutToBePublished.concernedStudentName,
            taskName: theWorkspaceAboutToBePublished.taskName,
            authorName: theWorkspaceAboutToBePublished.authorName
        });

        await dbopsServices.savePopulatedEntry(nextWorkspaceForThisUser);

        return nextWorkspaceForThisUser;
}


taskSubscriberServices.toggleLockOnStudentWorkspaceIfThisTaskUsesLocksAndSave =
    async function toggleLockOnStudentWorkspaceIfThisTaskUsesLocksAndSave
        (req, thisTask, compositeUserUnpublishedWorkspace, currentUserNextWorkspace) {

        // Only if locking is in this task's policy
        if (!thisTask.useLock) {
            return;
        }

        // If a counselor just posted, unlock the student
        if (req.user.admin) {
            compositeUserUnpublishedWorkspace.lockedForPublishing = false;
            await dbopsServices.savePopulatedEntry(compositeUserUnpublishedWorkspace);
        }
        // If a student just posted, lock their new fresh workspace
        else {
            currentUserNextWorkspace.lockedForPublishing = true;
            await dbopsServices.savePopulatedEntry(currentUserNextWorkspace);
        }

        return;
}


taskSubscriberServices.publishWorkspaceAndProvideAFreshNewOne =
    async function publishWorkspaceAndProvideAFreshNewOne(workspaceToPublish, workspaceNames, taskSubscriberObject){

        // Produce a fresh workspace to replace the current unpublished one that will be changed to publish
        let currentUserNextWorkspace =
            await taskSubscriberServices.produceTheNextWorkspaceForThisUser(workspaceToPublish);

        // Publish their work
        taskSubscriberObject[ workspaceNames[ 'currentUserPublishedWorkspace' ] ] = workspaceToPublish;
        // Give user a fresh workspace advanced by one number
        taskSubscriberObject[ workspaceNames[ 'currentUserUnpublishedWorkspace' ] ] = currentUserNextWorkspace;

        let updatedTaskSubscriberDocument =
            await dbopsServices.savePopulatedEntry(taskSubscriberObject);

        return [ updatedTaskSubscriberDocument, currentUserNextWorkspace ];
    }


taskSubscriberServices.createUploadedDocumentEntryForPublishedWork =
    async function createUploadedDocumentEntryForPublishedWork(req, taskSubscriberObject, currentUserUnpublishedWorkspace){

        let dataFields = (await formServices.getPromiseToParseForm(req))[0];
        let fileDescription = dataFields['memo'];

        let authorName = currentUserUnpublishedWorkspace.authorName;
        let studentName = currentUserUnpublishedWorkspace.concernedStudentName;
        let taskName = currentUserUnpublishedWorkspace.taskName;
        let filetype = isItASubmissionOrAResponseBasedOnWorkspace(currentUserUnpublishedWorkspace);
        let number = currentUserUnpublishedWorkspace.number;

        let newUploadedDocumentEntry = new UploadedDocument({
            documentName: `${filetype}${number}`,
            authorName: authorName,
            dateSubmitted: Date.now(),
            fileDescription: fileDescription,
            s3Path: `${studentName}/${taskName}/${filetype}${number}`
        });

        let savedUploadedDocumentEntry = await dbopsServices.savePopulatedEntry(newUploadedDocumentEntry);

        // Add UploadedDocument Entry to taskSubscriber's documents array
        taskSubscriberObject.documents = taskSubscriberObject.documents.concat([ savedUploadedDocumentEntry ]);
        let updatedTaskSubscriberDocument =
            await dbopsServices.savePopulatedEntry(taskSubscriberObject);

        return updatedTaskSubscriberDocument;
    }


let isItASubmissionOrAResponseBasedOnWorkspace = function(workspace){
    if (workspace.authorName === workspace.concernedStudentName) { return 'Submission' }
    else { return 'Response' }
}


module.exports = taskSubscriberServices;
