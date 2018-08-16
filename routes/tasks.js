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

// See a task
router.get('/:taskId/:userId', authServices.confirmUserIdentity, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users', 'files', 'comments'], req, res),
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res),
        user = req.user,
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

// Add to a Task
router.put('/:taskId', authServices.isAdmin, async function(req, res) {
    let checkedUserIds = taskServices.getCheckedUsers(req, res),
        foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users' ], req, res);

    for (var i = 0; i < checkedUserIds.length; i++) {
        let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [ 'tasks' ], req, res);
        foundTask.users.push(checkedUserEntry);
        checkedUserEntry.tasks.push(foundTask);
        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
        // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
    }

    dbopsServices.savePopulatedEntry(foundTask, req, res);


    res.redirect('back');
});

// All Tasks View
router.get('/', authServices.isAdmin, async function(req, res) {

    // Fetch tasks
    let tasks = await dbopsServices.findAllEntriesAndPopulate(Task, { }, ['files', 'comments', 'users'], req, res);

    res.render('tasks', {
        user: req.user,
        tasks: tasks,
        loggedIn: true
    });
});


// All Tasks View
router.post('/', authServices.isAdmin, async function(req, res) {
    let data = await taskServices.getTaskData(req, res),
        newTaskEntryData = new Task({
          title: data.title,
          prompt: data.prompt
        }),
        newTask = await dbopsServices.createEntryAndSave(Task, newTaskEntryData, req, res, true);

        // Saving etc properly up to here :)

    res.redirect('/tasks');
    // foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ ], req, res),
    // newTaskData = new Task({ title: fileData.fileName, author: foundUser.username, submission: newSubmission });
//         newComment = await dbopsServices.createEntryAndSave(Comment, newCommentData, req, res);

// res.render('tasks', {
//         loggedIn: true,
//         user: req.user
//     });

});

// // Create New Submission
// router.post('/', authServices.confirmUserCredentials, async function(req, res) { //IMPORTANT: normally you would use a post request to an index page but I already have one POST req going there for Users
//     ,
//

//     newSubmission.user = foundUser;
//     newSubmission.messages.push(newComment);
//     newSubmission.adds.push(newAdd);
//     console.log("just checking");
//     dbopsServices.savePopulatedEntry(newSubmission, req, res);
//     console.log("saved once");
//     foundUser.submissions.push(newSubmission);
//     dbopsServices.savePopulatedEntry(foundUser, req, res);
//     console.log("saved twice");
//     notifServices.assignNotification(req.user.username, newSubData.title, 'add', req.params.username, req, res);
//     res.redirect('/index/' + req.params.username);
// });

// // Show Submission
// router.get('/:id', authServices.confirmUserCredentials, async function(req, res) {
//     let foundSub = await dbopsServices.findOneEntryAndPopulate(Submission, { '_id': req.params.id }, [ 'user', 'messages', 'adds' ], req, res);

//     console.log(foundSub)

//     res.render('viewFile', {
//         sub: foundSub,
//         user: req.user,
//         client: foundSub.user,
//         loggedIn: true
//     });
// });

module.exports = router;
