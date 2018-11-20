// Shows modals for inserting or editing the name of a new or existing object
// Interface:
// Buttons for this modal need:
//    class='naming' since other buttons are for post, get etc etc (may also have other classes tied in)
//    name='type of object being edited or created' e.g. 'group' or 'task' etc, to use in the prompt
//    value='url' where to post the form
//    id='existing name if editing, else empty'

let modalNaming = new tingle.modal({
    footer: true,
    stickyFooter: false,
    cssClass: ['modal-naming'],
    closeMethods: [],
    onClose: function() {
        // Reset content
        modalNaming.setContent('');
        return;
    }
});

$('button').click(function(e){
    if ($(this).hasClass('naming')) {
        let buttonChosen = $(this);
        modalNaming.open();
        modalNaming.setContent(
            "<div> Enter a <b>name</b> for the " + $(this).attr('name') + ": </div>" +
            "<div style='padding-top: 5%; margin-bottom: -5%;'>" +
                "<form action='" + buttonChosen.val() + "' method='POST'>" +
                    "<input name='title' type='text' class='search' style='width:80%; color: black;' value='" + $(this).attr('id') + "' onfocus='this.setSelectionRange(0, this.value.length)' required />" +
                    "<button id='naming-form-submit' type='submit' style='visibility:hidden;'></button>" +
                "</form>" +
             "</div>"
        );
        $('input[name=title]').focus();
    }
});

modalNaming.addFooterBtn('Done', 'tingle-btn tingle-btn--primary', function() {
    // Need to submit form through a classic submit button to make use of the 'required' property of input fields
    // Otherwise form can be sent blank as well
    $('#naming-form-submit').click();
    return;
});

modalNaming.addFooterBtn('Dismiss', 'tingle-btn tingle-btn--danger', function() {
    modalNaming.close();
});
