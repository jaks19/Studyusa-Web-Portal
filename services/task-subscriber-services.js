const dbopsServices = require('../services/dbops-services');

const Workspace = require('../models/workspace');
const TaskSubscriber = require('../models/taskSubscriber');
const Task = require('../models/task')

const constants = require('../config/constants')

let taskSubscriberServices = {};

taskSubscriberServices.getFreshWorkspaces = async function getFreshWorkspaces (task, counselorDoc, studentDoc) {

    let defaultContentCounselor = constants.DEFAULT_PROMPT_PRE + String(counselorDoc.username) + constants.DEFAULT_PROMPT_POST;
    let defaultContentStudent = constants.DEFAULT_PROMPT_PRE + String(studentDoc.username) + constants.DEFAULT_PROMPT_POST;

    let counselorWorkspace = new Workspace({
        number: 0,
        content: defaultContentCounselor,
        concernedStudentName: studentDoc.username,
        taskName: task.title,
        authorName: counselorDoc.username,
    });

    // Starts unlocked then need to toggle each time they subscribe and when counselor responds after they submitted
    let studentWorkspace = new Workspace({
        number: 0,
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

module.exports = taskSubscriberServices;
