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
let User            = require("../models/user"),
    Task            = require("../models/task"),
    TaskSubscriber  = require("../models/taskSubscriber"),
    Commentary      = require("../models/commentary");

let router = express.Router({ mergeParams: true });

let DEFAULT_PROMPT_PRE = '<h2 style="text-align: center;"><span style="background-color: #ffff99;">Hey ',
    DEFAULT_PROMPT_POST = '!</span></h2>\r\n<h5 style="text-align: center;">My name\'s <span style="background-color: #00ffff;">Tiny the word processor</span> and I\'m your new best friend! Forget MS Word or Google Docs, because I am cooler than them.&nbsp;<img src="https://cloud.tinymce.com/stable/plugins/emoticons/img/smiley-cool.gif" alt="cool" /></h5>\r\n<h5 style="text-align: center;"><span style="color: #626262; background-color: #ffffff;"><span style="background-color: #ffcc99;">I promise to autosave your writing</span> so you can leave your work, even close this window etc and seamlessly resume when you are back!</span></h5>\r\n<h5 style="text-align: center;">Together we will <span style="background-color: #ccffcc;">write our way to the best universities in the world</span>!</h5>\r\n<h5 style="text-align: center;">You may <span style="background-color: #ff99cc;">begin your work by deleting all this text</span>.</h5>\r\n<p>&nbsp;</p>\r\n<p style="text-align: left;">&nbsp;</p>\r\n<h6 style="text-align: center;"><span style="font-family: century_gothic;"><strong><em>Quick tip:</em></strong></span></h6>\r\n<h5 style="text-align: center;"><span style="font-family: \'book antiqua\', palatino;">When you want to change font sizes, locate the menu bar where the \'File\', \'Edit\', \'View\', \'Insert\' options etc are found. </span></h5>\r\n<h5 style="text-align: center;"><span style="font-family: \'book antiqua\', palatino;">Click on the option BELOW the \'File\' option and choose from:</span></h5>\r\n<h1 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 1</span></h1>\r\n<h2 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 2</span></h2>\r\n<h3 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 3</span></h3>\r\n<h4 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 4</span></h4>\r\n<h5 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 5</span></h5>\r\n<h6 style="text-align: center;"><span style="font-family: iskoola_pota;">Heading 6</span></h6>\r\n<p style="text-align: center;"><span style="font-family: iskoola_pota;">Paragraph</span></p>';

// Create new task (title only at this pt)
router.post('/new', authServices.isAdmin, async function(req, res) {
    let title = req.body.title,
        prompt = DEFAULT_PROMPT_PRE + String(req.user.username) + DEFAULT_PROMPT_POST,
        newTaskEntryData = new Task({ title: title, prompt: prompt }),
        taskCreated = await dbopsServices.createEntryAndSave(Task, newTaskEntryData, req, res, true),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.user.username}, [ ], req, res);

    res.render('./admin/editTaskPrompt', {
        user: user,
        task: taskCreated,
        loggedIn: true
    });
});


// Add/remove users to a Task
router.put('/:taskId/users', authServices.isAdmin, async function(req, res) {
    let [incomingIds, outgoingIds] = taskServices.getCheckedUsers(req, res),
        foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users' ], req, res),
        incoming = []; // Keep an array of incoming User objects too for including in group

    if(typeof incomingIds[0] !== "undefined") {
        for (var i = 0; i < incomingIds.length; i++) {
            let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': incomingIds[i] }, [ 'tasks' ], req, res);
            incoming.push(checkedUserEntry);
            checkedUserEntry.tasks = checkedUserEntry.tasks.concat([foundTask]);
            await dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
            // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
        }
    }

    if(typeof outgoingIds[0] !== "undefined") {
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



// See a task's Dashboard where one can upload responses and comments
router.get('/:taskId/dashboard/:userId', authServices.confirmUserCredentials, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ 'users', 'files', 'comments'], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, { _id: req.params.userId }, [ ], req, res);

    // Filter comments so that a task-student pair only has the comments of that user
    // For other routes, they are not even populated
    let userComments = foundTask.comments.filter(function(comment) {
        if (String(comment.author._id) === String(user._id)){
            return true;
        } else if (comment.recipient != null){
            if (String(comment.recipient._id) === String(user._id)){
                return true;
            }
        }
        return false
    });

    // TODO: same filtering with files, once implemented

    foundTask.comments = userComments;

        res.render('viewTaskDashboard', {
            user: user,
            task: foundTask,
            loggedIn: true,
            viewer: req.user
        });
});


// Edit Prompt (edits in place, so does not redirect)
router.put('/:taskId/prompt', authServices.isAdmin, async function(req, res) {
    let data = await taskServices.getTaskData(req, res);

    if (data.prompt != null) {
        await dbopsServices.updateEntryAndSave(Task, { _id: req.params.taskId }, { prompt: data.prompt, dateEdited: Date.now() }, req, res);
    }

    res.send('Task was autosaved!');
});


// Edit Title (Unlike editing prompt, this one redirects)
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

// For an already-created task, the page to Edit
router.get('/:taskId/edit', authServices.isAdmin, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ ], req, res),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.params.username}, [ ], req, res);

    res.render('./admin/editTaskPrompt', {
        user: user,
        task: foundTask,
        loggedIn: true
    });
});


// See a task's prompt and title
router.get('/:taskId/preview', authServices.confirmUserCredentials, async function(req, res) {
    let foundTask = await dbopsServices.findOneEntryAndPopulate(Task, { _id: req.params.taskId }, [ ], req, res, { users: 0, comments: 0, files: 0}),
        user = await dbopsServices.findOneEntryAndPopulate(User, {username: req.params.username}, [ ], req, res);

        res.render('viewTaskPreview', {
            user: user,
            task: foundTask,
            loggedIn: true
        });
});







let promiseToPopulate = function(queryObject, fieldsString){

    return queryObject.populate(fieldsString).exec();

};

let findOneEntryAndPopulate = async function(model, entryRequirement, fieldsArray, req, res, exclude={}) {
    let query = model.find(entryRequirement),
        entry;

    try { entry = await promiseToPopulate(query, fieldsString) }
    catch (err) {
          // req.flash('error', err);
          // res.redirect('back');
          console.log('error');
          return;
      }

  return entry;
}



// TESTING
router.get('/:taskId/test/:userId', authServices.confirmUserCredentials, async function(req, res) {

    // let foundTask = Task
    //     .find({ _id: req.params.taskId })
    //     .populate({
    //         path: 'taskSubscribers',
    //         model: 'TaskSubscriber',
    //         populate: {
    //             path: 'comments',
    //             model: 'Commentary'
    //         }
    //     })
    //     .exec(function(err, task){
    //         if (err) { console.log(err); }
    //         console.log(task);
    //     });




    res.send('OK');
});



// Delete
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

// All Tasks View
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

module.exports = router;
