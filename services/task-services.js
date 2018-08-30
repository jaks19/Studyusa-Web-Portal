let taskServices = {};

const dbopsServices = require('../services/dbops-services');

const User            = require('../models/user');
const Task            = require("../models/task");
const TaskSubscriber  = require('../models/taskSubscriber');

taskServices.sortCheckedIds = function sortCheckedIds ( incomingIds, outgoingIds, task ) {
    let archivedSubscribersIds =
        task.archivedTaskSubscribers.map(ats => String(ats.user._id));
    let idsFirstTime =
        incomingIds.filter(_id => !archivedSubscribersIds.includes(_id));
    let idsToUnarchive =
        incomingIds.filter(_id => archivedSubscribersIds.includes(_id));
    let idsToArchive = outgoingIds;

    return [ idsFirstTime, idsToUnarchive, idsToArchive ];
}

taskServices.getWhoToArchiveAndUnarchive =
    function getWhoToArchiveAndUnarchive (idsFirstTime,  idsToUnarchive, idsToArchive, task) {

        let subscriberDocsToUnarchive = task.archivedTaskSubscribers
            .filter(ats => idsToUnarchive.includes(String(ats.user._id)));
        let subscriberDocsToArchive = task.taskSubscribers
            .filter(ts => idsToArchive.includes(String(ts.user._id)));

        return [ subscriberDocsToUnarchive, subscriberDocsToArchive ];
}

taskServices.getTotallyNewSubscriberDocuments =
    async function getTotallyNewSubscriberDocuments (idsFirstTime, task) {

        let newSubscriberDocs = [];
        for (var i = 0; i < idsFirstTime.length; i++) {
            let user = await dbopsServices.findOneEntryAndPopulate(User, { '_id': idsFirstTime[i] }, [ 'tasks' ], true);
            let totallyNewSubscriberData = new TaskSubscriber({ user: user, task: task });
            let totallyNewSubscriber = await dbopsServices.savePopulatedEntry(totallyNewSubscriberData);
            newSubscriberDocs.push(totallyNewSubscriber);
        }
        return newSubscriberDocs;
}

taskServices.getStayingPutSubscribers =
    function getStayingPutSubscribers ( idsToUnarchive, idsToArchive, task ) {

    let keptAsSubscribers = task.taskSubscribers.filter(ts => !idsToArchive.includes(String(ts.user._id)));
    let keptAsArchived = task.archivedTaskSubscribers.filter(ats => !idsToUnarchive.includes(String(ats.user._id)));

    return [ keptAsSubscribers, keptAsArchived ];
}

taskServices.applyFindingsToTask =
    function applyFindingsToTask(task, keptAsSubscribers, newSubscriberDocs,
        subscriberDocsToUnarchive, keptAsArchived, subscriberDocsToArchive){

        task.taskSubscribers =
            keptAsSubscribers
            .concat(newSubscriberDocs)
            .concat(subscriberDocsToUnarchive);

        task.archivedTaskSubscribers =
            keptAsArchived.concat(subscriberDocsToArchive);

        return task;
}

taskServices.prepareAdminDashboardData =
    async function prepareAdminDashboardData(requestInfo){

        let [ taskId, viewer, soughtUserId ] = requestInfo;
        let taskSubscriberObject;
        let taskObjectFullyLoaded;

        taskObjectFullyLoaded = await dbopsServices.findOneEntryAndDeepPopulate(Task,
            { _id: taskId }, [ 'taskSubscribers.user', 'taskSubscribers.comments' ], true);

        // Admin not on their own dashboard
        // If on their own dashboard, the specific taskSubscriberObject remains undefined
        if (String(viewer._id) !== String(soughtUserId)) {
            taskSubscriberObject = (taskObjectFullyLoaded.taskSubscribers
                .filter(ts => String(ts.user._id) === String(soughtUserId)))[0];
        }

        return [ taskObjectFullyLoaded, taskSubscriberObject ];
}

taskServices.prepareUserDashboardData =
    async function prepareUserDashboardData(requestInfo){

        let [ taskId, viewer, soughtUserId ] = requestInfo;
        let taskSubscriberObject;
        let taskObjectFullyLoaded;

        // A user here has to be on their own dashboard since we check their credentials
        // Populate everything at first, to extract required taskSubscriber
        taskObjectFullyLoaded = await dbopsServices.findOneEntryAndDeepPopulate(Task,
            { _id: taskId }, [ 'taskSubscribers.user', 'taskSubscribers.comments' ], true);

        // Get only this user's taskSubscriber object
        taskSubscriberObject = taskObjectFullyLoaded.taskSubscribers
            .filter(ts => String(ts.user._id) === String(soughtUserId))[0];

        // Reduce the unnecessarily exposed data
        taskObjectFullyLoaded.taskSubscribers = [ ];
        taskObjectFullyLoaded.archivedTaskSubscribers = [ ];

        return [ taskObjectFullyLoaded, taskSubscriberObject ];
}


taskServices.recycleTaskSubscribers = function recycleTaskSubscribers(taskToDelete) {
    let taskSubscribersToRecycle = taskToDelete.taskSubscribers
        .concat(taskToDelete.archivedTaskSubscribers);

    for (var i = 0; i < taskSubscribersToRecycle.length; i++) {
        let ts = taskSubscribersToRecycle[i];
        dbopsServices.findEntryByIdAndRemove(TaskSubscriber, ts._id);
    }
    return;
}

module.exports = taskServices;
