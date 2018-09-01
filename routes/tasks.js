// Ref: a task stores everything, users, files, comments
// When loading a task for a user, look at files/comments etc in task and filter

// Packages
const express        = require("express");
const constants      = require('../config/constants');
const authServices   = require('../services/auth-services');
const dbopsServices  = require('../services/dbops-services');
const notifServices  = require('../services/notif-services');
const formServices   = require('../services/form-services');
const taskServices   = require('../services/task-services');

// Models
const User            = require("../models/user");
const Task            = require("../models/task");
const TaskSubscriber  = require("../models/taskSubscriber");
const Commentary      = require("../models/commentary");

const router = express.Router({ mergeParams: true });

// Create new task (title only at this pt) OK
router.post('/new', authServices.isAdmin, async function(req, res) {
    try {
        let title = req.body.title;

        let prompt = constants.DEFAULT_PROMPT_PRE +
                     String(req.user.username) +
                     constants.DEFAULT_PROMPT_POST;

        let newTaskEntryData = new Task({ title: title, prompt: prompt });
        let taskCreated = await dbopsServices.savePopulatedEntry(newTaskEntryData);

        res.render('./admin/editTaskPrompt', {
            user: req.user,
            task: taskCreated,
            loggedIn: true
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});


// Add/remove users to a Task OK
router.put('/:taskId/users', authServices.isAdmin, async function(req, res) {

    try {
        let checkedValuesByName = formServices.getCheckedValuesByName(['incoming', 'outgoing'], req);
        let incomingIds = checkedValuesByName['incoming'];
        let outgoingIds = checkedValuesByName['outgoing'];

        let foundTask = await dbopsServices.findOneEntryAndDeepPopulate(Task, { _id: req.params.taskId },
            [ 'taskSubscribers.user.tasks', 'archivedTaskSubscribers.user.tasks' ], false);

        let [ idsFirstTime, idsToUnarchive, idsToArchive ] =
            taskServices.sortCheckedIds(incomingIds, outgoingIds, foundTask);

        let [ subscriberDocsToUnarchive, subscriberDocsToArchive ] =
            taskServices.getWhoToArchiveAndUnarchive(idsFirstTime,  idsToUnarchive, idsToArchive, foundTask);

        let totallyNewSubscriberDocs =
            await taskServices.getTotallyNewSubscriberDocuments(idsFirstTime, foundTask, req);

        let [ keptAsSubscribers, keptAsArchived ] =
            taskServices.getStayingPutSubscribers(idsToUnarchive, idsToArchive, foundTask);

        let updatedTaskDocument = taskServices.applyFindingsToTask(foundTask, keptAsSubscribers, totallyNewSubscriberDocs,
            subscriberDocsToUnarchive, keptAsArchived, subscriberDocsToArchive);

        await dbopsServices.savePopulatedEntry(foundTask)
    }

    catch (error) { req.flash('error', error.message) }

    res.redirect('back');
});


// See a task's Dashboard where one can upload responses and comments OK
router.get('/:taskId/dashboard/:userId', authServices.confirmUserIdentity, async function(req, res) {

    try {
        // Extracted from request
        let taskId = req.params.taskId;
        let viewer = req.user;
        let soughtUserId = req.params.userId;

        // Exposing proper amount of data
        let requestInfo = [ taskId, viewer, soughtUserId ];
        let exposedTaskObject, taskSubscriberObject;

        if (viewer.admin) { [ exposedTaskObject, taskSubscriberObject ] =
            await taskServices.prepareAdminDashboardData(requestInfo) }
        else { [ exposedTaskObject, taskSubscriberObject ] =
            await taskServices.prepareUserDashboardData(requestInfo) }

        res.render('viewTaskDashboard', {
            task: exposedTaskObject,
            loggedIn: true,
            user: req.user,
            taskSubscriber: taskSubscriberObject
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }

});


// Edit Prompt (edits in place, so does not redirect) OK
router.put('/:taskId/prompt', authServices.isAdmin, async function(req, res) {

    try {
        let dataFields = (await formServices.getPromiseToParseForm(req))[0];
        let prompt = dataFields['prompt'];

        if (prompt != null) {
            await dbopsServices.findByIdAndUpdate(Task, { _id: req.params.taskId },
                { prompt: prompt, dateEdited: Date.now() });
        }

        res.send('Task was autosaved!');
    }

    catch (error) { req.flash('error', error.message); }

});


// Edit Title (Unlike editing prompt, this one redirects) OK
router.put('/:taskId/title', authServices.isAdmin, async function(req, res) {

    try {
        let title = req.body.title;
        let foundTask = await dbopsServices.findByIdAndUpdate(Task, req.params.taskId, {
                title: title,
                dateEdited: Date.now()
            });

        // Renders same page as if we just created task and editing the prompt
        res.render('./admin/editTaskPrompt', {
            user: req.user,
            task: foundTask,
            loggedIn: true
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }


});

// For an already-created task, the page to Edit OK
router.get('/:taskId/edit', authServices.isAdmin, async function(req, res) {

    try {
        let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ ], true);
        let user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.params.username}, [ ], true);

        res.render('./admin/editTaskPrompt', {
            user: user,
            task: foundTask,
            loggedIn: true
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }

});


// See a task's prompt and title OK
router.get('/:taskId/preview', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ ], true,
            { users: 0, comments: 0, files: 0});

        res.render('viewTaskPreview', {
            user: req.user,
            task: foundTask,
            loggedIn: true
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});


// Delete OK
router.delete('/:taskId', authServices.isAdmin, async function(req, res) {

    try {
        let foundTask = await dbopsServices.findOneEntryAndDeepPopulate(Task, { '_id': req.params.taskId },
            [ 'taskSubscribers.user', 'archivedTaskSubscribers.user' ], true);

        // TaskSubscriber objects attached will not be deleted and will be left in the database for referencing
        await dbopsServices.findEntryByIdAndRemove(Task, req.params.taskId);
    }

    catch (error) { req.flash('error', error.message) }

    res.redirect('back');
});


// All Tasks View OK
router.get('/', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let user = req.user;

        if (user.admin) {
            let tasks = await dbopsServices.findAllEntriesAndDeepPopulate(Task, { }, [ 'taskSubscribers.user', 'taskSubscribers.comments' ], true);
            let users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], true);

            res.render('./admin/tasks', {
                user: user,
                users: users,
                tasks: tasks,
                loggedIn: true
            });
        }

        else {
            let taskSubscriberObjectsThisUser = await dbopsServices.findAllEntriesAndPopulate(TaskSubscriber,
                { user: user._id }, [ 'task', 'comments' ], true);

            res.render('tasks', {
                user: user,
                taskSubscriberObjects: taskSubscriberObjectsThisUser,
                loggedIn: true
            });
        }
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});

module.exports = router;
