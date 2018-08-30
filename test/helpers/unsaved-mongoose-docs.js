var User = require('../../models/user');
var Commentary = require('../../models/commentary');
var Task = require('../../models/task');
var TaskSubscriber = require('../../models/taskSubscriber');


exported = {}

exported.user1 = new User({
    username: '1',
    name: ' user 1',
    password: 'passwordDummy1'
});

exported.user2 = new User({
    username: '2',
    name: ' user 2',
    password: 'passwordDummy2'
});

exported.user3 = new User({
    username: '3',
    name: ' user 3',
    password: 'passwordDummy3'
});

exported.user4 = new User({
    username: '4',
    name: ' user 4',
    password: 'passwordDummy4'
});

exported.admin1 = new User({
    username: 'admin1',
    name: 'admin user 1',
    password: 'passwordAdmin1',
    admin: true
});

exported.admin2 = new User({
    username: 'admin2',
    name: 'admin user 2',
    password: 'passwordAdmin2',
    admin: true
});

exported.comment1 = new Commentary({
    author: exported.user1,
    recipient: exported.admin1,
    date: Date.now(),
    content: 'This is a comment'
});

exported.comment2 = new Commentary({
    author: exported.user2,
    recipient: exported.admin1,
    date: Date.now(),
    content: 'This is a comment too'
});

exported.taskSubscriber1 = new TaskSubscriber({
    user: exported.user1,
    unpublishedWorkspace: 'This is my work',
    comments: [ exported.comment1, exported.comment2 ]
});

exported.taskSubscriber2 = new TaskSubscriber({
    user: exported.user2,
    unpublishedWorkspace: 'Hi this is a workspace',
    comments: [ exported.comment1, exported.comment2 ]
})

exported.taskSubscriber3 = new TaskSubscriber({
    user: exported.user3,
    unpublishedWorkspace: 'Hi this is an essay',
    comments: [ exported.comment1, exported.comment2 ]
});

exported.taskSubscriber4 = new TaskSubscriber({
    user: exported.user4,
    unpublishedWorkspace: 'Hi this is a poem',
    comments: [ exported.comment1, exported.comment2 ]
})

exported.task1 = new Task({
    title: 'Task title1',
    prompt: 'This is the promp for task 1',
    dateCreated: Date.now(),
    dateEdited: Date.now(),
    taskSubscribers: [ exported.taskSubscriber1 ],
    archivedTaskSubscribers: [ exported.taskSubscriber2 ]
})

exported.task2 = new Task({
    title: 'Task title2',
    prompt: 'This is the promp for task 2',
    dateCreated: Date.now(),
    dateEdited: Date.now(),
    taskSubscribers: [ exported.taskSubscriber3 ],
    archivedTaskSubscribers: [ exported.taskSubscriber4 ]
})

exported.message1 = exported.comment1;

exported.message2 = exported.comment2;

module.exports = exported;
