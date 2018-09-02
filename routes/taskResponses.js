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
router.get('/:userId', authServices.confirmUserIdentity, async function(req, res) {
    try {
        // Need to know if need counselor's OR student's workspace depending on who is writing in the workspace
        let theNeededWorkspace =
            await taskSubscriberServices.whichWorkspaceIsNeededBasedOnRequestingUser(req);

        let thisTaskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
                user: req.params.userId,
                task: req.params.taskId
            }, [ theNeededWorkspace, 'user', 'task' ], false);

        res.render('./taskRespond', {
            // The author
            user: req.user,
            task: thisTaskSubscriber['task'],
            // May match author or not if admin is writing
            student: thisTaskSubscriber['user'],
            workspace: thisTaskSubscriber[ theNeededWorkspace ],
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
                await taskSubscriberServices.whichWorkspaceIsNeededBasedOnRequestingUser(req);

            let thisTaskSubscriber = await dbopsServices.findOneEntryAndPopulate(TaskSubscriber, {
                    user: req.params.userId,
                    task: req.params.taskId
                }, [ theNeededWorkspace ], true);

            let theWorkspaceDoc = thisTaskSubscriber[ theNeededWorkspace ];

            await dbopsServices.findByIdAndUpdate(Workspace, { _id: theWorkspaceDoc._id },
                { content: updatedContentForWorkspace, dateEdited: Date.now() });
        }

        res.send('Task was autosaved!');
    }

    catch (error) { req.flash('error', error.message) }

});


module.exports = router;
