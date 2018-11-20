// Exposed backend variables:
// user,
// task,
// student,
// workspace

require('../tinyMCEWithAutosave.js');

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
    // Only admin sees a reminder of the student name
    $('#additionalText').append($.parseHTML(`<h6>Student: ${concernedStudentName}</h6>`));
}
else {
    responseOrSubmission = 'Submission';
}

// For both admin and student, add a title, with corresponding word 'Submission' or 'Response'
let titleStringHTML = `<h4 class='unbroken-title'>Working on ${responseOrSubmission} no. ${cardinal} for task: ${taskTitle}</h4>`;
$('#titleString').append($.parseHTML(titleStringHTML));



// If press button for Fullscreen

$('button').click(function(e){
    if ($(this).data('button-purpose') === 'fullscreen-button'){
        tinymce.get('area').execCommand('mceFullScreen');
    }
});
