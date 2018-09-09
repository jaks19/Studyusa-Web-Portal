const express = require("express");
const authServices = require('../services/auth-services');
const dbopsServices = require('../services/dbops-services');
const notifServices = require('../services/notif-services');
const taskSubscriberServices = require('../services/task-subscriber-services');
const formServices   = require('../services/form-services');

const Task = require("../models/task");
const TaskSubscriber = require("../models/taskSubscriber");
const Commentary = require("../models/commentary");
const Workspace = require("../models/workspace");


let router = express.Router({ mergeParams: true });

// Show page to work on latest draft
// May have query param useOtherPersonWorkspace = true or false
router.get('/:userId', authServices.confirmUserIdentity, async function(req, res) {

    try {
        // Need to know if need counselor's OR student's workspace depending on who is writing in the workspace
        let theNeededWorkspaceName =
            taskSubscriberServices.getAllWorkspaceNames(req)[ 'currentUserUnpublishedWorkspace' ];

        let compositeUserPublishedWorkspaceName =
            taskSubscriberServices.getAllWorkspaceNames(req)[ 'compositeUserPublishedWorkspace' ];

        let thisTaskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
                user: req.params.userId,
                task: req.params.taskId
            }, [ theNeededWorkspaceName, compositeUserPublishedWorkspaceName, 'user', 'task' ], false);

        // If this user wants to pre-populate their workspace W with content from last published workspace V of the composite user
        // Copy V's content into W and save
        // Note: choice presented in front-end and here we just process query params to see if they want to do that
        if (req.query.useOtherPersonWorkspace) {
            thisTaskSubscriber[ theNeededWorkspaceName ][ 'content' ] = thisTaskSubscriber[ compositeUserPublishedWorkspaceName ][ 'content'];
            await dbopsServices.savePopulatedEntry(thisTaskSubscriber[ theNeededWorkspaceName ]);
        }

        res.render('./taskRespond', {
            // The author
            user: req.user,
            task: thisTaskSubscriber['task'],
            // May match author or not if admin is writing
            student: thisTaskSubscriber['user'],
            workspace: thisTaskSubscriber[ theNeededWorkspaceName ],
            loggedIn: true
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});


// Edit Workspace (edits in place, so does not redirect)
// URL with info up to userId is enough to identify all needed records
// No need to overcomplicate URLS. Keep them simple and logical.
router.put('/:userId', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let dataFields = (await formServices.getPromiseToParseForm(req))[0];
        let updatedContentForWorkspace = dataFields['workspaceContent'];

        if (updatedContentForWorkspace != null) {

            // Which workspace is needed? The student's or the counselor's? Get the string identifier.
            let theNeededWorkspace =
                (await taskSubscriberServices.getAllWorkspaceNames(req))[ 'currentUserUnpublishedWorkspace' ];

            let thisTaskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
                    user: req.params.userId,
                    task: req.params.taskId
                }, [ theNeededWorkspace ], true);

            let theWorkspaceDoc = thisTaskSubscriber[ theNeededWorkspace ];

            await dbopsServices.findByIdAndUpdate(Workspace, { _id: theWorkspaceDoc._id },
                { content: updatedContentForWorkspace, dirty: true, dateEdited: Date.now() });
        }

        req.flash('info', 'Your work was autosaved.')
        res.send('Task was autosaved!');
    }

    catch (error) { req.flash('error', error.message) }

});


// Publish Workspace
// URL with info up to userId is enough to identify all needed records
// No need to overcomplicate URLS. Keep them simple and logical.
router.post('/:userId', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let allWorkspaceNames = taskSubscriberServices.getAllWorkspaceNames(req);

        let thisTaskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
            user: req.params.userId,
            task: req.params.taskId
        }, [ 'task', allWorkspaceNames[ 'currentUserUnpublishedWorkspace' ],
            allWorkspaceNames[ 'compositeUserUnpublishedWorkspace' ] ], false);

        let currentUserUnpublishedWorkspace =
            thisTaskSubscriber[ allWorkspaceNames[ 'currentUserUnpublishedWorkspace' ] ];

        if (currentUserUnpublishedWorkspace.lockedForPublishing) { req.flash('error', 'Your workstation is locked until you get back a response.') }

        [ thisTaskSubscriber, currentUserNextWorkspace ] =
            await taskSubscriberServices.publishWorkspaceAndProvideAFreshNewOne(currentUserUnpublishedWorkspace, allWorkspaceNames, thisTaskSubscriber);

        // Make an uploadedDocument document entry for easy retrieval of the task from s3
        // Save the new UploadedDocument to the taskSubscriber array of documents
        thisTaskSubscriber = await taskSubscriberServices.createUploadedDocumentEntryForPublishedWork(req, thisTaskSubscriber, currentUserUnpublishedWorkspace);

        // Toggle locks
        let thisTask = thisTaskSubscriber.task;
        let compositeUserUnpublishedWorkspace =
            thisTaskSubscriber[ allWorkspaceNames['compositeUserUnpublishedWorkspace' ] ];

        await taskSubscriberServices.
            toggleLockOnStudentWorkspaceIfThisTaskUsesLocksAndSave(req, thisTask, compositeUserUnpublishedWorkspace, currentUserNextWorkspace);

        await dbopsServices.savePopulatedEntry(thisTaskSubscriber);
        req.flash('success', `Your work was successfully submitted! Please wait for a response.`);
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect(`/index/${req.params.username}/tasks/${req.params.taskId}/dashboard/${req.params.userId}`);
});


module.exports = router;
