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
            "text" : "Write a few words to summarize what you wrote about in the work you are publishing"
        },

        {
            "kind" : "textarea",
            "name" : "memo",
            "text" : "Did you change the tone of your writing? Did you elaborate on a specific idea? Tell us what you did...",
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

        // If not locked AND untouched workspace, show overlay saying workspace empty
        if (unpublishedWorkspaceOfThisPerson.dirty == false) {
            $('.textual-empty').css('display', 'inline-block');
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
