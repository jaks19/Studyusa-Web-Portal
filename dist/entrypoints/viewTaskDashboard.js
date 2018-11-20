require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({10:[function(require,module,exports){
// Exposed backend variables:
// task,
// user,
// taskSubscriber

require('../timestampToElapsed.js');

// taskQuickViewUsers.ejs partial view's script
require('../../scripts/viewScripts/partials/taskQuickViewUsers.js');

// workspace.ejs partial view's script
require('../../scripts/viewScripts/partials/workspace.js');

// taskFileListOfAUser.ejs partial view's script
require('../../scripts/viewScripts/partials/taskFileListOfAUser.js');

},{"../../scripts/viewScripts/partials/taskFileListOfAUser.js":6,"../../scripts/viewScripts/partials/taskQuickViewUsers.js":7,"../../scripts/viewScripts/partials/workspace.js":8,"../timestampToElapsed.js":1}],8:[function(require,module,exports){
// Note on flows:
// 1.
// When someone has an empty workspace,
// If it is a counselor, they will be provided option of pre-populating their workspace
// with the last published work of the student and vice versa
//
// 2.
// When publishing their workspace, the user is presented with a modal to enter a
// statement about which changes were made in this submission (a bit like a commit message on git)
//
// 3.
// When a user has an empty workspace, a message shows in the workspace to say it is Empty
// and to encourage to press start writing
//
// 4. When workspace has been published, if this task uses locks, and if user is a student,
// workspace is locked and a message is shown on the workspace to show it is locked
//
// 5. Depending on whether can publish right now or if locked, the buttons to publish writing and resume
// writing are hidden
//
// 6. Depending on if the user's workspace is completely fresh or if it has been dirtied before,
// will show 'start writing' on button below workspace if completely fresh and 'resume writing'
// if dirtied already

// If someone's workspace is already dirty, set the class of the workspace anchor wrapping the workspace image
// to empty so that the modal for pre-populating the workspace does not show up


// Modal for using empty workspace or pre-populating with composite user's last published work
require('../../tingle/modalTwoButtonsDifferentLinksReusable.js');

// Modal asking explanation of user's work or changes made, before user published their work
require('../../tingle/formReusable.js');


window.onload = function(e) {
    // Init workspace names as they are used in most functions below
    let workspaceNames = whichWorkspacesNeeded(user);
    let nameOfCurrentWorkspaceOfUser = workspaceNames.nameOfCurrentWorkspaceOfUser;
    let nameOfLastPublishedWorkspaceOfUser = workspaceNames.nameOfLastPublishedWorkspaceOfUser;
    let nameOfLastPublishedWorkspaceOfCompositeUser = workspaceNames.nameOfLastPublishedWorkspaceOfCompositeUser;

    // Init workspace objects
    let unpublishedWorkspaceOfUser = taskSubscriber[ nameOfCurrentWorkspaceOfUser ];
    let lastPublishedWorkspaceOfUser = taskSubscriber[ nameOfLastPublishedWorkspaceOfUser ];
    let lastPublishedWorkspaceOfCompositeUser = taskSubscriber[ nameOfLastPublishedWorkspaceOfCompositeUser ];

    initializeWorkspaceAppearance(unpublishedWorkspaceOfUser, lastPublishedWorkspaceOfUser);
    initializePublishButtonData();
    initializePossibilityOfPrepopulatingUserWorkspace(user, unpublishedWorkspaceOfUser, lastPublishedWorkspaceOfCompositeUser, taskSubscriber);

    // Tingle form modal submits the form with id #theFormGenerated
    // When user decides to publish their work, and a form is about to be submitted
    // Intercept the submission, send file to s3, then allow form to submit
    $(document).on('submit', $('#theFormGenerated'), function(e){
        submitFormWhileUploadingFileInBackground(unpublishedWorkspaceOfUser);
    });

    return;
};

// HELPER FUNCTIONS ONLY BELOW

// Given a user, returns the identifier string of the other user that will view their work
// i.e. 'student' returned if user is a 'counselor' and vice versa
// To be used in the dom
let getIdentifierStringOfCompositeUser = function(user) {
    if (user.admin) { return 'Student' }
    else { return 'Counselor' }
}


// Given the user object returns an object with the string for the workspaces (current and last published) belonging to that
// user, and the composite user
let whichWorkspacesNeeded = function(user){
    let workspaceNames = {}

    if (user.admin){
        workspaceNames.nameOfCurrentWorkspaceOfUser = 'unpublishedWorkspaceCounselor';
        workspaceNames.nameOfLastPublishedWorkspaceOfUser = 'lastPublishedWorkspaceCounselor';
        workspaceNames.nameOfLastPublishedWorkspaceOfCompositeUser = 'lastPublishedWorkspaceStudent';
    }  else {
        workspaceNames.nameOfCurrentWorkspaceOfUser = 'unpublishedWorkspaceStudent';
        workspaceNames.nameOfLastPublishedWorkspaceOfUser = 'lastPublishedWorkspaceStudent';
        workspaceNames.nameOfLastPublishedWorkspaceOfCompositeUser = 'lastPublishedWorkspaceCounselor';
    }

    return workspaceNames;
}


// Returns true if this user is still open to possibly pre-populating their workspace with the composite user's
// last published work for easier editing
let theUserCanBeAskedIfTheyWantToPrePopulateTheirWorkspace = function (user,
    currentWorkspaceOfUser, lastPublishedWorkspaceOfCompositeUser, taskSubscriberObject) {

        // If this user has a fresh workspace and there is some work already from the composite user
        // Then can propose to pre-populate their workspace
        if (!currentWorkspaceOfUser.dirty
            && typeof lastPublishedWorkspaceOfCompositeUser !== "undefined") {
            return true
        }

        return false;
}


// The publish button takes a JSON array as data and it is created dynamically in this script,
// rather than being added manually in the ejs view
// This function does this initialization
let initializePublishButtonData = function(){
    let rawLabelsAndFieldsString = `[
        {
            "kind" : "label",
            "text" : "In one sentence, summarize the work you are submitting."
        },

        {
            "kind" : "textarea",
            "name" : "memo",
            "text" : "Are you adopting a certain thesis? Did you change something specific with respect to old versions? Did you re-organize your paragraphs? Tell us what you did...",
            "type" : "text",
            "value" : " ",
            "required" : "required",
            "rows" : 5
        }
    ]`

    $('#buttonPublish').data('labels-and-fields', JSON.parse(rawLabelsAndFieldsString));
    return;
}


// Depending on user has a locked workspace, and whether their workspace is empty,
// toggles the appropriate overlays, messages and buttons ON/OFF
//
// Note: if creator of the task has chosen to use locking, preventing users from submitting twice
// and having to wait for counselor to post a response before the user's next possible submission,
// then locking mechanism occurs in backend, front end only checks if locked or not
let initializeWorkspaceAppearance = function(unpublishedWorkspaceOfThisPerson, lastPublishedWorkspaceOfThisPerson){
    // If locked or not, toggle buttons and overlay
    if (unpublishedWorkspaceOfThisPerson.lockedForPublishing) {
        // Toggle buttons OFF and make overlay saying 'Locked' appear
        $('#buttonPublish').css('display', 'none');
        $('#buttonResume').css('display', 'none');
        $('.textual-locked').css('display', 'inline-block');

        // Make contents of the workspace appear very faint in the workspace picture
        let workspaceTextLocked = lastPublishedWorkspaceOfThisPerson.content;
        let workspaceTextHTML = $.parseHTML(workspaceTextLocked);
        $('.workspace').append(workspaceTextHTML);
    }

    else {
        // Make contents of the workspace appear very faint in the workspace picture
        let workspaceTextUnlocked = unpublishedWorkspaceOfThisPerson.content;
        let workspaceTextHTML = $.parseHTML(workspaceTextUnlocked);
        $('.workspace').append(workspaceTextHTML);

        // If not locked AND untouched workspace,
        // show overlay saying workspace empty, hide publish button and make #resumeButton say 'Start writing'
        if (unpublishedWorkspaceOfThisPerson.dirty == false) {
            $('#buttonPublish').css('display', 'none');
            $('#linkOpenWorkspace').text('New Document');
            $('.textual-empty').css('display', 'inline-block');
        }

        else {
            // Not locked and not a new document
            $('#linkOpenWorkspace').text('Resume Writing');
        }
    }

    return;
}


let initializePossibilityOfPrepopulatingUserWorkspace = function(user, unpublishedWorkspaceOfUser,
    lastPublishedWorkspaceOfCompositeUser, taskSubscriber){
        let identifierStringOfCompositeUser = getIdentifierStringOfCompositeUser(user);

        if (theUserCanBeAskedIfTheyWantToPrePopulateTheirWorkspace(user, unpublishedWorkspaceOfUser,
            lastPublishedWorkspaceOfCompositeUser, taskSubscriber)) {
            $('a.two-button-press').data('message',
            `Your workspace is currently empty. <break> Would you like to <b>fill it with your ${identifierStringOfCompositeUser}'s last response</b> for easier editing?`);
        }
        // Else remove the data-modal-name attribute of the href element so that the modal does not fire for asking to pre-populate
        else { $('a.two-button-press').data('modal-name',' ') }
        return;
}


// When a workspace is published, the text (in HTML format) is sent to AmazonS3 via this function
// Function uses the signedURL parameter (does not do the call to backend for the signedURL)
let uploadFile = function (signedUrlToUploadFile, workspace) {
    let contentString = workspace.content;

    // Need to wrap content in a Blob object which has metadata about the file content
    // Else file is saved as .txt, even if generate signedURL in backend by specifying text/html
    let blobFromString = new Blob([ contentString ], {type: 'text/html'});

    let requestToUploadToS3 = new XMLHttpRequest();
    requestToUploadToS3.open('PUT', signedUrlToUploadFile, false);
    requestToUploadToS3.send(blobFromString);

    if (requestToUploadToS3.status !== 200) { alert('Could not publish at this moment.') }
    // Else let the flow continue
    return;
}


let submitFormWhileUploadingFileInBackground = function(unpublishedWorkspaceOfUser){
    let requestToApiForSignedS3URL = new XMLHttpRequest();
    requestToApiForSignedS3URL.open('GET', `/api/s3upload/${unpublishedWorkspaceOfUser._id}`, false);
    requestToApiForSignedS3URL.send();

    if (requestToApiForSignedS3URL.status === 200) {
        const response = JSON.parse(requestToApiForSignedS3URL.responseText);
        uploadFile(response.signedUrl, unpublishedWorkspaceOfUser)
    }
    else { alert('Could not get signed URL.') }

    // return true to allow form submission to continue, after file was uploaded on the sly to S3
    return true
}

},{"../../tingle/formReusable.js":2,"../../tingle/modalTwoButtonsDifferentLinksReusable.js":4}],7:[function(require,module,exports){
$(document).ready(function() {
    var $item = $('div.item'), // Number of items to have in carousel
        visible = 4, // Set the number of items that will be visible at a time
        index = 0, // Starting index
        endIndex = ( $item.length / visible ) - 1; //End index

    $('div#arrowR').click(function(){
        if(index < endIndex ){
          index++;
          $item.animate({'left':'-=300px'});
        }
    });

    $('div#arrowL').click(function(){
        if(index > 0){
          index--;
          $item.animate({'left':'+=300px'});
        }
    });

    $('#quick-view').draggable();

});

// On Mouseenter, make the card rise by 3 px
$('.item').mouseenter( function(){ $(this).css('bottom', '+=3') });

// On Mouseleave, make the card fall by 3 px
$('.item').mouseleave( function(){ $(this).css('bottom', '-=3') });

},{}],6:[function(require,module,exports){
// Shows a modal with a tinyMCE editor in read-only mode
// Purpose is to show a file submitted in the past without the possibility of editing it
// Could have just displayed the html but some inherited css ruins the formatting
let modalTinyMCE= new tingle.modal({
    footer: false,
    stickyFooter: false,
    cssClass: [ 'modal-tiny-mce' ],
    closeMethods: [ 'button' ],
    closeLabel: 'Close', // For mobile
    onClose: function() {
        tinymce.remove();
    },
    onOpen: function() {
        tinymce.init({
            selector: '#areaId',
            height: 500,
            theme: 'modern',
            readonly: 1,
            branding: false,
            menubar: false,
            statusbar: false,
            toolbar: false
        });
    }
});


// When user chooses a file to view, the link clicked has class 'downloadFile'
// A call is made to our API to get a signed URL to then download the file from Amazon S3
// This function makes the call to our API for the signed URL and used the 'downloadFile' function
// to get the contents from Amazon S3
$('.downloadFile').click(function(e){
    e.preventDefault();

    let requestToApiForSignedS3URL = new XMLHttpRequest();
    let uploadedDocumentId = $(this).data('document-id');
    let documentName = $(this).data('document-name');
    requestToApiForSignedS3URL.open('GET', `/api/s3download/${uploadedDocumentId}`, false);
    requestToApiForSignedS3URL.send();

   if (requestToApiForSignedS3URL.status === 200) {
     const response = JSON.parse(requestToApiForSignedS3URL.responseText);
     downloadFile(response.signedUrl, documentName);
   }

   else{ alert('Could not get signed URL.') }
   return;
});


 // Downloads user's selected file from Amazon S3 using the signed URL obtained from backend
 // Document name provided is obtained from somewhere else when user has clicked on the link for a specific file
 function downloadFile(signedUrl, documentName){
     let requestForFileData = new XMLHttpRequest();
     requestForFileData.open('GET', signedUrl, false);
     requestForFileData.send();

     if (requestForFileData.status === 200) {
         showFile(requestForFileData.responseText);
     }

     else{ alert('Could not get File to read.') }
     return;
 }


 // Shows the user's file contents in a text area, when provided with the file's contents
 // from Amazon S3
 function showFile (responseTextFromAmazonS3File) {
     modalTinyMCE.open();
     modalTinyMCE.setContent(
         `<div>
            <textarea id='areaId'></textarea>
          </div>
          <div style='text-align: center; margin-top:2%;'>
            <small class='text-muted'>Scroll down to see the whole document</small>
         </div>`
     );

     $('#areaId').text(responseTextFromAmazonS3File);
 }

},{}],4:[function(require,module,exports){
// Shows a modal with a message and two buttons, each with a different action (like: 'use empty workspace' & 'use counselor workspace')
// Interface:
// Object pressed has class two-button-press with attributes:
// link-one: first href value
// link-two: second href value
// message: message to show, using <break> to break to multiple divs'
// button-one: text for first button
// button-two: text for second button

let modalTwoButtonsDifferentLinks = new tingle.modal({
    footer: true,
    stickyFooter: false,
    cssClass: [ 'modal-message' ],
    closeMethods: [ 'button' ],
    onClose: function() {},
    closeLabel: 'close' // For mobile
});


// TODO: Pull this method into a file (used in message modal as well)
// For a message inserted inside an HTML object, no need to put HTML tags
// If want to indicate a line break, simply add <break> to the message String and this function
// Makes sure to create one <div>TEXT</div> per unbroken piece
// Provide the message text and a classname for those divs if needed
let breakMessageIfNeeded = function (message, classNameForDivs) {

    let finalHTMLString='';
    for (const unbrokenSegment of message.split('<break>')) {
        finalHTMLString += `<div class="${classNameForDivs}">${unbrokenSegment}</div>`;
    }

    return finalHTMLString;
}


$('button, a').click(function(e){
    if ($(this).data('modal-name') === 'modalTwoButtonsDifferentLinks') {

        let clickedObject = $(this);
        e.preventDefault();

        let textForFirstButton = clickedObject.data('button-one');
        let textForSecondButton = clickedObject.data('button-two');

        let hiddenMessage = clickedObject.data('message');
        let hiddenMessageProcessedWithDesiredTags = breakMessageIfNeeded(hiddenMessage, 'message-div');

        modalTwoButtonsDifferentLinks.open();
        modalTwoButtonsDifferentLinks.setContent(
            hiddenMessageProcessedWithDesiredTags
        );


        // Create buttons in here for scope of buttons text
        modalTwoButtonsDifferentLinks.addFooterBtn(textForFirstButton, 'tingle-btn tingle-btn--info', function() {
            // Add link to body and click to follow an href in the normal browser way
            $('body').append(`<a href="${clickedObject.data('link-one')}" id="link1" style="visibility: hidden;">.</a>`);
            let toBeClicked = document.getElementById("link1");
            toBeClicked.click();
            modalTwoButtonsDifferentLinks.close();
            return;
        });

        modalTwoButtonsDifferentLinks.addFooterBtn(textForSecondButton, 'tingle-btn tingle-btn--danger', function() {
            // Add link to body and click to follow an href in the normal browser way
            $('body').append(`<a href="${clickedObject.data('link-two')}" id="link2" style="visibility: hidden;">.</a>`);
            let toBeClicked = document.getElementById("link2");
            toBeClicked.click();
            modalTwoButtonsDifferentLinks.close();
            return;
        });
    }
    return;
});

},{}],2:[function(require,module,exports){
// Shows a modal with a form that needs to be filled and submitted
// Interface:
// Need a button with
// - data-modal-name ='form-modal' to be pressed
// - data-message = message to display in modal above form
//
// - data-action = link for form to submit
// - data-labels-and-fields = [ array of form inputs and fields (call it X) ]
//      X for input has format {
//          kind: 'input',
//          name: 'a name to fetch the value in backend'
//          text: placeholder text
//          type: 'text' or 'email' or 'password' or 'number' etc etc (label does not need to fill this)
//          required: 'required' string or ' ' empty string
//      }
//
//      X for textarea has same format as but kind:'textarea', and a field for rows: number
//
//      X for label has format {
//          kind: 'label',
//          text: text that goes in the label element
//      }
//
//      We mix both input and label in same array so that we can know the order of the fields
//      Example if have one label and three input fields, need to know that order

let modalForm= new tingle.modal({
    footer: true,
    stickyFooter: false,
    cssClass: [ 'modal-form' ],
    closeMethods: [ ],
});


$('button').click(function(e){
    if ($(this).data('modal-name') === 'form-modal') {

        let buttonChosen = $(this);
        let formAction = buttonChosen.data('action');
        let formLabelsAndFieldsData = buttonChosen.data('labels-and-fields');
        let textForFirstButton = buttonChosen.data('button-one');
        let textForSecondButton = buttonChosen.data('button-two');

        let formHTMLString = createFormHTMLString(formAction, formLabelsAndFieldsData);

        modalForm.open();
        modalForm.setContent(formHTMLString);

        modalForm.addFooterBtn(textForFirstButton, 'tingle-btn tingle-btn--primary form-button-yes', function() {
            // submit using button for usual form behaviour (redirecting etc)
            $('#theFormGenerated').find('button').click();

            modalForm.close();
            return;
        });

        modalForm.addFooterBtn(textForSecondButton, 'tingle-btn tingle-btn--danger', function() {
            modalForm.close();
            return;
        });
    }

    return;
});


// Given a div, the action for the form, the array of objects described at top of the page
let createFormHTMLString = function (formAction, formLabelsAndFieldsData) {

    let formHTMLString = `<form id='theFormGenerated' action='${formAction}' method='POST' enctype='multipart/form-data'>`;

    for (const fieldOrLabel of formLabelsAndFieldsData) {
        if (fieldOrLabel['kind'] === 'label') { formHTMLString += packageLabel(fieldOrLabel) }
        else if (fieldOrLabel['kind'] === 'input') { formHTMLString += packageInput(fieldOrLabel) }
        else if (fieldOrLabel['kind'] === 'textarea') { formHTMLString += packageTextarea(fieldOrLabel) }
    }

    // Add a hidden button so that submitting form follows all normal browser actions like when a form
    // is submitted through the dom
    formHTMLString += `<button id='submitFormWhenPressModalYes' type='submit' style='visibility:hidden;'></button>`

    return formHTMLString;
}


// We know the object is a label based on its 'kind', return the HTML string for that label
let packageLabel = function(labelObject) {
    return `<label> ${labelObject.text} </label>`;
}

// We know the object is an input based on its 'kind', return the HTML string for that input
let packageInput = function(inputObject) {
    return `<input name='${inputObject.name}' placeholder='${inputObject.text}' type='${inputObject.type}' ${inputObject.required}>  </input>`;
}

// We know the object is a textarea based on its 'kind', return the HTML string for that textarea
let packageTextarea = function(textareaObject) {
    return `<textarea name='${textareaObject.name}' placeholder='${textareaObject.text}' rows=${textareaObject.rows} type='${textareaObject.type}' ${textareaObject.required}></textarea>`;
}

},{}],1:[function(require,module,exports){
window.onload = function (e) {
    // Taking the date and converting to local time zone and to desired format
    var spansList = $('.comment > .timestring');

    $.each(spansList, function( i, val ) {
          var timeDateText = $(val).text();
          var momentObj = moment(timeDateText);
          /// We have our String e.g. 5 seconds ago, a year ago ...
          var timespent = momentObj.fromNow();
          $(this).text(timespent);
    });
};

},{}]},{},[10]);
