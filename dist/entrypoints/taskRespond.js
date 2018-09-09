require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({9:[function(require,module,exports){
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

},{"../tingle/messagePressOkReusable.js":3,"../tinyMCE/editorWithAutosave.js":5}],5:[function(require,module,exports){
// tinyMCE init settings
let plugins         = 'print emoticons code searchreplace autolink directionality visualchars fullscreen image link media table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools mediaembed linkchecker contextmenu colorpicker textpattern help',
    toolbar1        = 'formatselect | bold italic strikethrough forecolor backcolor | fontselect | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat | emoticons',
    mobile          = { theme: 'mobile', plugins: [ 'autosave', 'lists', 'autolink' ], toolbar: [ 'undo', 'bold', 'italic', 'styleselect' ] },
    content_css     = [ '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i', '//www.tinymce.com/css/codepen.min.css' ],
    font_formats    = "Andale Mono=andale mono,times;"+"Arial=arial,helvetica,sans-serif;"+"Arial Black=arial black,avant garde;"+"Book Antiqua=book antiqua,palatino;"+"Comic Sans MS=comic sans ms,sans-serif;"+"Courier New=courier new,courier;"+"Century Gothic=century_gothic;"+"Georgia=georgia,palatino;"+"Gill Sans MT=gill_sans_mt;"+"Gill Sans MT Bold=gill_sans_mt_bold;"+"Gill Sans MT BoldItalic=gill_sans_mt_bold_italic;"+
                      "Gill Sans MT Italic=gill_sans_mt_italic;"+"Helvetica=helvetica;"+"Impact=impact,chicago;"+"Iskola Pota=iskoola_pota;"+"Iskola Pota Bold=iskoola_pota_bold;"+"Symbol=symbol;"+"Tahoma=tahoma,arial,helvetica,sans-serif;"+"Terminal=terminal,monaco;"+"Times New Roman=times new roman,times;"+"Trebuchet MS=trebuchet ms,geneva;"+"Verdana=verdana,geneva;"+"Webdings=webdings;"+"Wingdings=wingdings,zapf dingbats";

// Keypress and MouseMove events both set this to true to allow document to be saved in the next scheduler cycle
// Prevents autosaving if user is idle (e.g. leaves tab open for hours or even days)
let isTheUserIdle = true;

tinymce.init({
    selector: 'textarea',
    height: 500,
    theme: 'modern',
    plugins: plugins,
    toolbar1: toolbar1,
    image_advtab: true,
    branding: false,
    elementpath: false,
    visual: false,
    mobile: mobile,
    removed_menuitems: 'newdocument',
    content_css: content_css,
    font_formats: font_formats,
    setup: function(editor) {
        editor.on('KeyPress', function(e) {
            // ALT-F was pressed (KeyPress not triggerred on escabe and other combinations already bound by browser)
            // Need to also listen on the dom for the combination. (To exit fullscreen)
            // THis fires when editor active (and dom does not when editor active)
            if (e.altKey && (e.code === 'KeyF')){
                tinymce.get('area').execCommand('mceFullScreen');
            }

            // Set isTheUserIdle to false to indicate the need to autosave in the next scheduler cycle
            isTheUserIdle = false;
            return;
        });

        editor.on('MouseMove', function(e) {
            // Set isTheUserIdle to false to indicate the need to autosave in the next scheduler cycle
            isTheUserIdle = false;
            return;
        });
    }
});


// Bind ALT-f to escape full screen (Trigerred when tinymce editor not in focus)
// ESC would have been ideal but the tinymce listener (for when editor active)
// Does not fire on ESC

$(document).keyup(function(e){
    // letter 'f' => keyCode 70
    if(e.altKey && e.keyCode === 70){
        tinymce.get('area').execCommand('mceFullScreen');
    }
});


// Prevent Bootstrap dialog from blocking focusin on the editor iFrame elements
$(document).on('focusin', function(e) {
    if ($(e.target).closest(".mce-window").length) {
            e.stopImmediatePropagation();
        }
});


// Submits the form to the action address
let submit = function(tinymce_object, textareaId, formId, ajaxSubmitOptions){
    // Need to manually set content of textarea, from the editor
    let editor = tinymce_object.get(textareaId);

    // Check if editor not empty before saving
    // (Especially if someone opened editor for the first time but did not type, to maintain editor-empty responses)
    // Sure, if user had typed but then erased everything, erasure is not saved
    // But accept this compromise as no loss of info occurs pertaining to user work
    if(editor.getContent() !== "") {
        $('#'+textareaId).val(editor.getContent());
        $('#'+formId).ajaxSubmit(ajaxSubmitOptions);
    }
}


// Ajax post request for saving takes options object
let optionsExit     = {async: false},
    optionsRegular  = {async: true};


// Auto-Save
// 1. Submit the form when page is exited (refreshed or closed or link clicked or quit browser)
//    Better than tinymce listener for mouseleave which is a subset
window.onbeforeunload = function (e) {
    submit(tinymce, 'area', 'form-submit', optionsExit);
    return undefined; // To actually exit page
};


// 2. Submit the form each time interval to avoid text sitting for a long time
//    Start once the dom + all resources are loaded
//    Check isTheUserIdle for true to prevent overloading server if user is idle
window.onload = function (e) {
    let timeIntervalMinutes = 0.1;

    setInterval(function(){
        if (!isTheUserIdle){
            submit(tinymce, 'area', 'form-submit', optionsRegular);
            isTheUserIdle = true;
        }
    }, timeIntervalMinutes*60*1000);
}

},{}],3:[function(require,module,exports){
// Shows a modal with a message and need to press ok to proceed woth no further logic
// Interface:
// Need a button with class='message-button' to be pressed and the button has an attribute called 'data-message' that has the message to be displayed

let modalMessage= new tingle.modal({
    footer: true,
    stickyFooter: false,
    cssClass: ['modal-message'],
    closeMethods: [],
    onClose: function() {},
    closeLabel: 'Ok' // For mobile
});


// For a message inserted inside a button in the attribute 'message', no need to put HTML tags
// If want to indicate a line break, simply add <break> to the message String and this function
// Makes sure to create one <div>TEXT</div> per unbroken piece
// Provide a classname for those divs if needed
let breakMessageIfNeeded = function (message, classNameForDivs) {

    let finalHTMLString='';
    for (const unbrokenSegment of message.split('<break>')) {
        finalHTMLString = finalHTMLString + `<div class="${classNameForDivs}">${unbrokenSegment}</div>`;
    }

    return finalHTMLString;
}


$('button').click(function(e){
    if ($(this).data('modal-name') === 'message-modal') {

        let buttonChosen = $(this);
        let hiddenMessage = buttonChosen.data('message');
        let hiddenMessageProcessedWithDesiredTags = breakMessageIfNeeded(hiddenMessage, 'message-div');

        modalMessage.open();
        modalMessage.setContent(
            hiddenMessageProcessedWithDesiredTags
        );
    }

    return;
});

modalMessage.addFooterBtn('Ok', 'tingle-btn tingle-btn--primary', function() {
    modalMessage.close();
    return;
});

},{}]},{},[9]);
