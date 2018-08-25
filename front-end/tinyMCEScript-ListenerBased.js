// Knobs
let save = { needed: false },
    tooQuick = false,
    waitTimeSeconds = 10;

// Note: 'save' is made an object, not simple variable so as to use a Proxy which exposes listeners
// Setting save values by doing saveProxy.needed = true or false triggers the listener 'set'
let saveProxy = new Proxy(save, {
    set: function (target, key, value) {
        target[key] = value;
        // Do anything here!
        console.log(save);
        return true;
    }
});


// tinyMCE init settings
let plugins         = 'print emoticons searchreplace autolink directionality visualchars fullscreen image link media table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools mediaembed linkchecker contextmenu colorpicker textpattern help',
    toolbar1        = 'formatselect | bold italic strikethrough forecolor backcolor | fontselect | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
    mobile          = { theme: 'mobile', plugins: [ 'autosave', 'lists', 'autolink' ], toolbar: [ 'undo', 'bold', 'italic', 'styleselect' ] },
    content_css     = [ '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i', '//www.tinymce.com/css/codepen.min.css' ],
    font_formats    = "Andale Mono=andale mono,times;"+"Arial=arial,helvetica,sans-serif;"+"Arial Black=arial black,avant garde;"+"Book Antiqua=book antiqua,palatino;"+"Comic Sans MS=comic sans ms,sans-serif;"+"Courier New=courier new,courier;"+"Century Gothic=century_gothic;"+"Georgia=georgia,palatino;"+"Gill Sans MT=gill_sans_mt;"+"Gill Sans MT Bold=gill_sans_mt_bold;"+"Gill Sans MT BoldItalic=gill_sans_mt_bold_italic;"+
                      "Gill Sans MT Italic=gill_sans_mt_italic;"+"Helvetica=helvetica;"+"Impact=impact,chicago;"+"Iskola Pota=iskoola_pota;"+"Iskola Pota Bold=iskoola_pota_bold;"+"Symbol=symbol;"+"Tahoma=tahoma,arial,helvetica,sans-serif;"+"Terminal=terminal,monaco;"+"Times New Roman=times new roman,times;"+"Trebuchet MS=trebuchet ms,geneva;"+"Verdana=verdana,geneva;"+"Webdings=webdings;"+"Wingdings=wingdings,zapf dingbats";


// Functions used when tinyMCE editor listeners are triggered
// Events found at https://www.tiny.cloud/docs/advanced/events/
let changeReaction = function (e) {
    if (!tooQuick){
        saveProxy.needed = true;
        tooQuick = true;
        setTimeout(function(){ tooQuick = false }, waitTimeSeconds*1000);
    }
}

let keypressReaction = function (e) {
    if (!tooQuick){
        saveProxy.needed = true;
        tooQuick = true;
        setTimeout(function(){ tooQuick = false }, waitTimeSeconds*1000);
    }
}

let mouseleaveReaction = function (e) {
    if (!tooQuick){
        if (tinymce.get('area').isNotDirty == false){
            // if dirty
            saveProxy.needed = true;
            // On mouseleaving make editor not dirty to prevent someone from just
            // mouse-entering and mouse-leaving repeatedly and saving the same content
            tinymce.get('area').isNotDirty = true;
            tooQuick = true;
        }
        setTimeout(function(){ tooQuick = false }, waitTimeSeconds*1000);
    }
}


// Listeners put together in a function that gets called once editor is init'ed
let init_instance_callback = function (editor) {

     // When clicking into editor, press enter for new paragraph, any font changes etc (One undo level)
     editor.on('Change', changeReaction);
     // Change listener misses keypresses when typing same paragraph on and on, without any enter press or font changes etc
     editor.on('KeyPress', keypressReaction);
     // Leaving the editor space, no need to click outside, only need (x,y) to be outside
     editor.on('MouseLeave', mouseleaveReaction);

     return true;
}


// Actual instance initialization, instance is from the script in the header of HTML
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
    init_instance_callback: init_instance_callback,

    //   setup: function(editor) {
    //     editor.on('init', function(e) {
    //       editor.execCommand('mcePreview');
    //     });
    // },
    // save_onsavecallback: function () { console.log('Saved'); },
});


// Prevent Bootstrap dialog from blocking focusin on the editor iFrame elements
$(document).on('focusin', function(e) {
    if ($(e.target).closest(".mce-window").length) {
            e.stopImmediatePropagation();
        }
});


// TODO: If the page is exited, save before exiting, on top of the above autosave


// Ajax post request for saving can take an options object
// We use a pre and post submit function
// Note : other available options are :-
    // target:    '#output2',    // target element(s) to be updated with server response
    // url:        url,          // override for form's 'action' attribute
    // type:       type,         // 'get' or 'post', override for form's 'method' attribute
    // dataType:   null,         // 'xml', 'script', or 'json' (expected server response type)
    // clearForm: false,        // clear all form fields after successful submit
    // resetForm:  true          // reset the form after successful submit

let options = {
    // beforeSubmit: preSubmit,
    // success: postSubmit
};

// Submit the form with id 'form-submit'in the background
// $("#form-submit").ajaxForm(options);























//
// // pre-submit callback
// function preSubmit(formData, jqForm, options) {
//
//     // formData is an array; here we use $.param to convert it to a string to display it
//     // but the form plugin does this for you automatically when it submits the data
//     var queryString = $.param(formData);
//
//     // jqForm is a jQuery object encapsulating the form element.  To access the
//     // DOM element for the form do this:
//     // var formElement = jqForm[0];
//
//     alert('About to submit: \n\n' + queryString);
//
//     // here we could return false to prevent the form from being submitted;
//     // returning anything other than false will allow the form submit to continue
//     return true;
// }
//
// // post-submit callback
// function postSubmit(responseText, statusText, xhr, $form)  {
//     // if the ajaxSubmit method was passed an Options Object with the dataType
//     // property set to 'xml' or json etc then server response: 'responseText'
//     // is in that format
//
//     alert('status: ' + statusText + '\n\nresponseText: \n' + responseText +
//         '\n\nThe output div should have already been updated with the responseText.');
//
//     tinymce.get('area').setMode('readonly');
//
//     return true;
// }
