const User = require('../../models/user');
const Commentary = require('../../models/commentary');
const Task = require('../../models/task');
const TaskSubscriber = require('../../models/taskSubscriber');
const Workspace = require('../../models/workspace');


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

exported.workspace1 = new Workspace({
    published: true,
    number: 10,
    lockedForPublishing: false,
    content: 'This is my work',
    concernedStudentName: 'Student 1',
    taskName: 'Task 100',
    authorName: 'Mr. Foobar',
    authorMemo: 'I have worked on my thesis',
    datePublished: Date.now(),
    dateEdited: Date.now()
})

exported.workspace2 = new Workspace({
    published: false,
    number: 3,
    lockedForPublishing: true,
    content: 'Today is a good day',
    concernedStudentName: 'Student Havana',
    taskName: 'Task 007',
    authorName: 'Sam Smith',
    authorMemo: 'Last draft',
    datePublished: Date.now(),
    dateEdited: Date.now()
})

exported.taskSubscriber1 = new TaskSubscriber({
    user: exported.user1,
    task: exported.task1,
    unpublishedWorkspaceCounselor: exported.workspace1,
    unpublishedWorkspaceStudent: exported.workspace2,
    comments: [ exported.comment1, exported.comment2 ]
});

exported.taskSubscriber2 = new TaskSubscriber({
    user: exported.user2,
    task: exported.task2,
    unpublishedWorkspaceCounselor: exported.workspace2,
    unpublishedWorkspaceStudent: exported.workspace1,
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
