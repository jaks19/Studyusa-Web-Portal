// Exposed backend variables:
// task,
// user,
// taskSubscriber

var taskQuickViewUsersTemplate = require('../../views/partials/taskQuickViewUsers.ejs');
var taskQuickViewUsersHTML = taskQuickViewUsersTemplate({task: task});
$('#quick-view').append($.parseHTML(taskQuickViewUsersHTML));
var taskQuickViewUsersScript = require('../../scripts/viewScripts/partials/taskQuickViewUsers.js');
