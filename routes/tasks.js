// For routing to /tasks/ pages which are admin-only

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
    Feedback = require("../models/feedback"),
    File = require("../models/file");

let router = express.Router({ mergeParams: true });

// Add/remove users to a Task
router.put('/:taskId/users', authServices.confirmUserCredentials, async function(req, res) {
    let [incomingIds, outgoingIds] = taskServices.getCheckedUsers(req, res),
        foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users' ], req, res);

    console.log(incomingIds, outgoingIds);

    if(typeof incomingIds[0] !== "undefined")
    {
        console.log('NOOOO');
        for (var i = 0; i < incomingIds.length; i++) {
            let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': incomingIds[i] }, [ ], req, res);
            checkedUserEntry.tasks.push(foundTask);
            dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
            foundTask.users.push(checkedUserEntry);
            // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
            dbopsServices.savePopulatedEntry(foundTask, req, res);
        }
    }

    if(typeof outgoingIds[0] !== "undefined")
    {
        // for (var i = 0; i < outgoingIds.length; i++) {
        //     let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { '_id': outgoingIds[i] }, [ ], req, res),
        //         userNewTasks = foundUser.tasks.map((task) => {
        //             if (outgoingIds[i] !== String(task._id)){
        //                 return  task
        //             } else {
        //                 return;
        //             }
        //         }),
        //         console.log(userNewTasks);
        //         userNewTasks = foundUser.tasks
        //
        //     await dbopsServices.updateEntryAndSave(User, { '_id': outgoingIds[i] }, { $unset: {"group": null}});
        //     notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req, res);
        //     foundGroup.users.pull(foundUser);
        //     dbopsServices.savePopulatedEntry(foundGroup, req, res);
        // }
    }


    res.redirect('back');
});



// edit content of a task
router.put('/:taskId/content', authServices.isAdmin, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users' ], req, res),
        data = await taskServices.getTaskData(req, res);

    foundTask.title = data.title;
    foundTask.prompt = data.prompt;
    dbopsServices.savePopulatedEntry(foundTask, req, res);
    res.redirect('back');
});



// See a task
router.get('/:taskId/:userId', authServices.confirmUserIdentity, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users', 'files', 'comments'], req, res),
        user = req.user,
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res),
        client = await dbopsServices.findOneEntryAndPopulate(User, { _id: req.params.taskId }, [], req, res);

    console.log('HIT');
    if (user.admin){
        res.render('viewTaskAdmin', {
            user: req.user,
            client: req.user,
            users: users,
            task: foundTask,
            loggedIn: true
        });
    } else {
        res.render('viewTaskUser', {
            user: req.user,
            client: req.user,
            task: foundTask,
            loggedIn: true
        });
    }


});

// Delete
router.delete('/:taskId', authServices.isAdmin, async function(req, res) {
    await dbopsServices.findEntryByIdAndRemove(Task, req.params.taskId, req, res);
    res.redirect('back');
});

// All Tasks View
router.get('/', authServices.isAdmin, async function(req, res) {

    // Fetch tasks
    let tasks = await dbopsServices.findAllEntriesAndPopulate(Task, { }, ['files', 'comments', 'users'], req, res),
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res);

    res.render('tasksX', {
        user: req.user,
        users: users,
        tasks: tasks,
        loggedIn: true
    });
});


// All Tasks View
router.post('/', authServices.isAdmin, async function(req, res) {
    let data = await taskServices.getTaskData(req, res),
        newTaskEntryData = new Task({
          title: data.title,
          prompt: data.prompt,
        }),
        newTask = await dbopsServices.createEntryAndSave(Task, newTaskEntryData, req, res, true);

        // Saving etc properly up to here :)

    res.redirect('/tasks');

});

module.exports = router;
