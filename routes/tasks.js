// For routing to /tasks/ pages which are admin-only

// Ref: a task stores everything, users, files, comments
// When loading a task for a user, look at files in task and filter

// Packages
let express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    notifServices = require('../services/notif-services'),
    taskServices = require('../services/task-services');

// Models
let User            = require("../models/user"),
    Task            = require("../models/task"),
    TaskSubscriber  = require("../models/taskSubscriber"),
    Commentary      = require("../models/commentary");

let router = express.Router({ mergeParams: true });

let DEFAULT_PROMPT_PRE = '<h2 style="text-align: center;"><span style="background-color: #ffff99;">Hey ',
    DEFAULT_PROMPT_POST = '!</span></h2>\r\n<h5 style="text-align: center;">My name\'s <span style="background-color: #00ffff;">Tiny the word processor</span> and I\'m your new best friend! Forget MS Word or Google Docs, because I am cooler than them.&nbsp;<img src="https://cloud.tinymce.com/stable/plugins/emoticons/img/smiley-cool.gif" alt="cool" /></h5>\r\n<h5 style="text-align: center;"><span style="color: #626262; background-color: #ffffff;"><span style="background-color: #ffcc99;">I promise to autosave your writing</span> so you can leave your work, even close this window etc and seamlessly resume when you are back!</span></h5>\r\n<h5 style="text-align: center;">Together we will <span style="background-color: #ccffcc;">write our way to the best universities in the world</span>!</h5>\r\n<h5 style="text-align: center;">You may <span style="background-color: #ff99cc;">begin your work by deleting all this text</span>.</h5>\r\n<p>&nbsp;</p>\r\n<p style="text-align: left;">&nbsp;</p>\r\n<h6 style="text-align: center;"><span style="font-family: century_gothic;"><strong><em>Quick tip:</em></strong></span></h6>\r\n<h5 style="text-align: center;"><span style="font-family: \'book antiqua\', palatino;">When you want to change font sizes, locate the menu bar where the \'File\', \'Edit\', \'View\', \'Insert\' options etc are found. </span></h5>\r\n<h5 style="text-align: center;"><span style="font-family: \'book antiqua\', palatino;">Click on the option BELOW the \'File\' option and choose from:</span></h5>\r\n<h1 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 1</span></h1>\r\n<h2 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 2</span></h2>\r\n<h3 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 3</span></h3>\r\n<h4 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 4</span></h4>\r\n<h5 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 5</span></h5>\r\n<h6 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 6</span></h6>\r\n<p style="text-align: center;"><span style="font-family: iskoola_pota;">Paragraph</span></p>';

// Create new task (title only at this pt) OK
router.post('/new', authServices.isAdmin, async function(req, res) {
    let title = req.body.title,
        prompt = DEFAULT_PROMPT_PRE + String(req.user.username) + DEFAULT_PROMPT_POST,
        newTaskEntryData = new Task({ title: title, prompt: prompt }),
        taskCreated = await dbopsServices.savePopulatedEntry(newTaskEntryData, req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.user.username}, [ ], req, res);

    res.render('./admin/editTaskPrompt', {
        user: user,
        task: taskCreated,
        loggedIn: true
    });
});


// Add/remove users to a Task OK
router.put('/:taskId/users', authServices.isAdmin, async function(req, res) {
    let [incomingIds, outgoingIds] = taskServices.getCheckedUsers(req, res),
        foundTask = await dbopsServices.findOneEntryAndDeepPopulate(Task, { _id: req.params.taskId }, [ 'taskSubscribers.user', 'archivedTaskSubscribers.user' ], req, res),
        archivedSubscribersIds = foundTask.archivedTaskSubscribers.map(ats => String(ats.user._id)),
        existingSubscriberIds = foundTask.taskSubscribers.map(ts => String(ts.user._id));

    console.log(incomingIds, outgoingIds);

    let totallyNewSubscriberIds = incomingIds.filter(_id => !archivedSubscribersIds.includes(_id)),
        toUnarchiveSubscriberIds = incomingIds.filter(_id => archivedSubscribersIds.includes(_id)),
        toArchiveSubscriberIds = outgoingIds;

    let totallyNewSubscribers = [],
        toUnarchiveSubscribers = foundTask.archivedTaskSubscribers.filter(ats => toUnarchiveSubscriberIds.includes(String(ats.user._id))),
        toArchiveSubscribers = foundTask.taskSubscribers.filter(ts => toArchiveSubscriberIds.includes(String(ts.user._id)));

    // Create the totally-new taskSubscribers
    for (var i = 0; i < totallyNewSubscriberIds.length; i++) {
        let user = await dbopsServices.findOneEntryAndPopulate(User, { '_id': incomingIds[i] }, [ ], req, res),
            totallyNewSubscriberData = new TaskSubscriber({ user: user }),
            totallyNewSubscriber = await dbopsServices.savePopulatedEntry(totallyNewSubscriberData, req, res);

        totallyNewSubscribers.push(totallyNewSubscriber);
    }

    // Update the Task Document
    let keptAsSubscribers = foundTask.taskSubscribers.filter(ts => !toArchiveSubscriberIds.includes(String(ts.user._id)));
    foundTask.taskSubscribers = keptAsSubscribers.concat(totallyNewSubscribers).concat(toUnarchiveSubscribers);
    let keptAsArchived = foundTask.archivedTaskSubscribers.filter(ats => !toUnarchiveSubscriberIds.includes(String(ats.user._id)));
    foundTask.archivedTaskSubscribers = keptAsArchived.concat(toArchiveSubscribers);
    await dbopsServices.savePopulatedEntry(foundTask, req, res);

    res.redirect('back');
});


// See a task's Dashboard where one can upload responses and comments OK
router.get('/:taskId/dashboard/:userId', authServices.confirmUserCredentials, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndDeepPopulate(Task, { _id: req.params.taskId }, [ 'taskSubscribers.user', 'taskSubscribers.comments' ], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, { _id: req.params.userId }, [ ], req, res),
        viewer = req.user,
        taskSubscriber;

    // if not an admin viewing their own dashboard, need the taskSubscriber for their comments and files
    if (!((String(viewer._id) == String(user._id)) && viewer.admin)){
        taskSubscriber = foundTask.taskSubscribers.filter(ts => String(ts.user._id) === String(user._id))[0];
    }

    // if not an admin, need to hide the taskSubscribers list from the task (only need title and prompt)
    if (!(viewer.admin)){
        foundTask.taskSubscribers = []
    }

    res.render('viewTaskDashboard', {
        task: foundTask,
        loggedIn: true,
        viewer: req.user,
        user: user,
        taskSubscriber: taskSubscriber
    });
});


// Edit Prompt (edits in place, so does not redirect) OK
router.put('/:taskId/prompt', authServices.isAdmin, async function(req, res) {
    let data = await taskServices.getTaskData(req, res);

    if (data.prompt != null) {
        await dbopsServices.findByIdAndUpdate(Task, { _id: req.params.taskId }, { prompt: data.prompt, dateEdited: Date.now() }, req, res);
    }

    res.send('Task was autosaved!');
});


// Edit Title (Unlike editing prompt, this one redirects) OK
router.put('/:taskId/title', authServices.isAdmin, async function(req, res) {
    let title = req.body.title,
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.user.username}, [ ], req, res),

        foundTask = await dbopsServices.findByIdAndUpdate(Task, req.params.taskId, {
        title: title,
        dateEdited: Date.now()
    }, req, res);

    // Renders same page as if we just created task and editing the prompt
    res.render('./admin/editTaskPrompt', {
        user: user,
        task: foundTask,
        loggedIn: true
    });
});

// For an already-created task, the page to Edit OK
router.get('/:taskId/edit', authServices.isAdmin, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ ], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.params.username}, [ ], req, res);

    res.render('./admin/editTaskPrompt', {
        user: user,
        task: foundTask,
        loggedIn: true
    });
});


// See a task's prompt and title OK
router.get('/:taskId/preview', authServices.confirmUserCredentials, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ ], req, res, { users: 0, comments: 0, files: 0}),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.params.username}, [ ], req, res);

        res.render('viewTaskPreview', {
            user: user,
            task: foundTask,
            loggedIn: true
        });
});


// Delete OK
router.delete('/:taskId', authServices.isAdmin, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndDeepPopulate(Task, { '_id': req.params.taskId }, [ 'taskSubscribers.user', 'archivedTaskSubscribers.user' ], req, res);

    for (var i = 0; i < foundTask.taskSubscribers.length; i++) {
        let ts = foundTask.taskSubscribers[i];
        dbopsServices.findEntryByIdAndRemove(TaskSubscriber, ts._id, req, res);
    }

    for (var i = 0; i < foundTask.archivedTaskSubscribers.length; i++) {
        let ats = foundTask.archivedTaskSubscribers[i];
        dbopsServices.findEntryByIdAndRemove(TaskSubscriber, ats._id, req, res);
    }

    await dbopsServices.findEntryByIdAndRemove(Task, req.params.taskId, req, res);
    res.redirect('back');
});

// All Tasks View OK
router.get('/', authServices.confirmUserCredentials, async function(req, res) {
    // Fetch tasks
    let tasks = await dbopsServices.findAllEntriesAndDeepPopulate(Task, { }, [ 'taskSubscribers.user' ], req, res),
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, {'_id': req.user._id}, [ 'tasks' ], req, res),
        taskSubscriberObjectsThisUser = await dbopsServices.findAllEntriesAndPopulate(TaskSubscriber, { 'user': user._id }, [ 'comments' ], req, res);

    if (user.admin){
        res.render('./admin/tasks', {
            user: user,
            users: users,
            tasks: tasks,
            loggedIn: true
        });
    } else {
        res.render('tasks', {
            user: user,
            taskSubscriberObjects: taskSubscriberObjectsThisUser,
            loggedIn: true
        });
    }
});

module.exports = router;
