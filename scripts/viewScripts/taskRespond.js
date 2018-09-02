// Exposed backend variables:
// user,
// task,
// student,
// workspace

require('../tinyMCE/editorWithAutosave.js');

require('../tingle/messagePressOkReusable.js');


// Set text in title of this page based on backend variables

let cardinal = workspace.number;
let taskTitle = task.title;
let username = user.username;
let concernedStudentName = student.username;
let responseOrSubmission;
let receiverName;
let additionalText;


if (user.admin){
    responseOrSubmission = 'Response';
    additionalText = `Student: ${concernedStudentName}`;
}
else {
    responseOrSubmission = 'Submission';
    additionalText = `Author name: ${concernedStudentName}`;
}

let titleStringHTML = `<h4 class='unbroken-title'>Working on ${responseOrSubmission} no. ${cardinal} for task: </h4><h3 class='unbroken-title'> ${taskTitle}</h3>`;
$('#titleString').append($.parseHTML(titleStringHTML));

let additionalTextHTML = `<h6>${additionalText}</h6>`
$('#additionalText').append($.parseHTML(additionalTextHTML));
