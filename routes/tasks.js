// For routing to /tasks/ pages which are admin-only

// Ref: a task stores everything, users, files, comments
// When loading a task for a user, look at files in task and filter

// Packages
let express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    filesystemServices = require('../services/filesystem-services'),
    notifServices = require('../services/notif-services'),
    taskServices = require('../services/task-services');

// Models
let User = require("../models/user"),
    Task = require("../models/task"),
    File = require("../models/file");

let router = express.Router({ mergeParams: true });

// Add/remove users to a Task OK
router.put('/:taskId/users', authServices.isAdmin, async function(req, res) {
    let [incomingIds, outgoingIds] = taskServices.getCheckedUsers(req, res),
        foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users' ], req, res),
        incoming = []; // Keep an array of incoming User objects too for including in group

    if(typeof incomingIds[0] !== "undefined")
    {
        for (var i = 0; i < incomingIds.length; i++) {
            let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': incomingIds[i] }, [ 'tasks' ], req, res);
            incoming.push(checkedUserEntry);
            checkedUserEntry.tasks = checkedUserEntry.tasks.concat([foundTask]);
            await dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
            // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
        }
    }

    if(typeof outgoingIds[0] !== "undefined")
    {
        for (var i = 0; i < outgoingIds.length; i++) {
            let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { '_id': outgoingIds[i] }, [ 'tasks' ], req, res);
            foundUser.tasks = foundUser.tasks.filter( task => !(task._id === String(foundTask._id)) );
            await dbopsServices.savePopulatedEntry(foundUser, req, res);
            // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req, res);
        }
    }

    // PUSHING EACH TIME INTO A DB THEN SAVING IN THE END OR EVEN SAVING EACH TIME DOES NOT WORK WELL DIE TO CONCURRENY SO USIMG THIS:

    var usersOld = foundTask.users;
    var usersOldIn = usersOld.concat(incoming);
    foundTask.users = usersOldIn.filter( user => !outgoingIds.includes(String(user._id)) );
    await dbopsServices.savePopulatedEntry(foundTask, req, res);

    res.redirect('back');
});

// edit content of a task OK
router.put('/:taskId/content', authServices.isAdmin, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users' ], req, res),
        data = await taskServices.getTaskData(req, res);

    foundTask.title = data.title;
    foundTask.prompt = data.prompt;
    foundTask.dateEdited = Date.now();
    await dbopsServices.savePopulatedEntry(foundTask, req, res);
    res.redirect('back');
});

// See a task
router.get('/:taskId', authServices.confirmUserCredentials, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users', 'files', 'comments'], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.params.username}, [ 'tasks' ], req, res);

        res.render('viewTask', {
            user: user,
            task: foundTask,
            loggedIn: true,
            viewer: req.user
        });
});

// Delete OK
router.delete('/:taskId', authServices.isAdmin, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { '_id': req.params.taskId }, [ 'users' ], req, res),
    foundUsers = foundTask.users;
    for (var i = 0; i < foundTask.users.length; i++) {
        let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { '_id': foundTask.users[i]._id }, [ 'tasks' ], req, res);
        foundUser.tasks = foundUser.tasks.filter( task => !(task._id === foundTask._id) );
        await dbopsServices.savePopulatedEntry(foundUser, req, res);
        // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req, res);
    }

    await dbopsServices.findEntryByIdAndRemove(Task, req.params.taskId, req, res);
    res.redirect('back');
});

// All Tasks View OK
router.get('/', authServices.confirmUserCredentials, async function(req, res) {

    // Fetch tasks
    let tasks = await dbopsServices.findAllEntriesAndPopulate(Task, { }, ['files', 'comments', 'users'], req, res),
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, {'_id': req.user._id}, [ 'tasks' ], req, res);

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
            loggedIn: true
        });
    }
});


// New Task Creation OK
router.post('/', authServices.isAdmin, async function(req, res) {
    let data = await taskServices.getTaskData(req, res),
        newTaskEntryData = new Task({
          title: data.title,
          prompt: data.prompt,
        }),
        newTask = await dbopsServices.createEntryAndSave(Task, newTaskEntryData, req, res, true);

    res.redirect('back');

});

module.exports = router;
