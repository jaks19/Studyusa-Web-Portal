// tinyMCE init settings
let plugins         = 'print emoticons searchreplace autolink directionality visualchars fullscreen image link media table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools mediaembed linkchecker contextmenu colorpicker textpattern help',
    toolbar1        = 'formatselect | bold italic strikethrough forecolor backcolor | fontselect | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
    mobile          = { theme: 'mobile', plugins: [ 'autosave', 'lists', 'autolink' ], toolbar: [ 'undo', 'bold', 'italic', 'styleselect' ] },
    content_css     = [ '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i', '//www.tinymce.com/css/codepen.min.css' ],
    font_formats    = "Andale Mono=andale mono,times;"+"Arial=arial,helvetica,sans-serif;"+"Arial Black=arial black,avant garde;"+"Book Antiqua=book antiqua,palatino;"+"Comic Sans MS=comic sans ms,sans-serif;"+"Courier New=courier new,courier;"+"Century Gothic=century_gothic;"+"Georgia=georgia,palatino;"+"Gill Sans MT=gill_sans_mt;"+"Gill Sans MT Bold=gill_sans_mt_bold;"+"Gill Sans MT BoldItalic=gill_sans_mt_bold_italic;"+
                      "Gill Sans MT Italic=gill_sans_mt_italic;"+"Helvetica=helvetica;"+"Impact=impact,chicago;"+"Iskola Pota=iskoola_pota;"+"Iskola Pota Bold=iskoola_pota_bold;"+"Symbol=symbol;"+"Tahoma=tahoma,arial,helvetica,sans-serif;"+"Terminal=terminal,monaco;"+"Times New Roman=times new roman,times;"+"Trebuchet MS=trebuchet ms,geneva;"+"Verdana=verdana,geneva;"+"Webdings=webdings;"+"Wingdings=wingdings,zapf dingbats";


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
    $('#'+textareaId).val(editor.getContent());
    $('#'+formId).ajaxSubmit(ajaxSubmitOptions)
}


// Ajax post request for saving takes options object
let optionsExit     = {async: false},
    optionsRegular  = {async: true};

// Auto-Save
// 1. Submit the form when page is exited (refreshed or closed or link clicked or quit browser)
// Better than tinymce listener for mouseleave which is a subset
window.onbeforeunload = function (e) {
    submit(tinymce, 'area', 'form-submit', optionsExit);
    return undefined; // To actually exit page
};

// 2. Submit the form each time interval to avoid text sitting for a long time
// Start once the dom + all resources are loaded
window.onload = function (e) {
    let timeIntervalMinutes = 10;
    setInterval(function(){submit(tinymce, 'area', 'form-submit', optionsRegular)}, timeIntervalMinutes*60*1000);
}
