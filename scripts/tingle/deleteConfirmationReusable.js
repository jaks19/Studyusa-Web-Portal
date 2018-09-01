// Shows modals for delete confirmation
// Interface:
// Buttons for delete need:
//    class='deletion' since other buttons are for post, get etc etc (may also have other classes tied in)
//    name='name' of the object being deleted e.g. task name, to use in the prompt
//    value='url' where to post the delete form,

let modalDelete = new tingle.modal({
    footer: true,
    stickyFooter: false,
    cssClass: ['modal-deletion'],
    closeMethods: [],
    onClose: function() {
        // Reset content
        modalDelete.setContent('');
    }
});

let buttonPressed;

$('button').click(function(e){
    if ($(this).hasClass('deletion')) {
        buttonPressed = $(this);
        modalDelete.open();

        let content = "<div>Are you sure you want to <b>delete ";

        // "the task" / "the group" etc
        if ($(this).attr('object-type')){ content = content + "the " + $(this).attr('object-type') + " "; }
        // Obligatory name of the object e.g. Task 1
        content = content + $(this).attr('name') + "</b>?<div>"
        // Next line has a custom message. Like: "All work will be lost"
        if ($(this).attr('additional-message')){
            content = content + "<div>" + $(this).attr('additional-message') + "<div>";
        }

        modalDelete.setContent(content);
    }
});

modalDelete.addFooterBtn('Yes', 'tingle-btn tingle-btn--primary', function() {
    $('<form action="' + buttonPressed.val() + '" method="POST"></form>').appendTo('body').submit();
});

modalDelete.addFooterBtn('No', 'tingle-btn tingle-btn--danger', function() {
    modalDelete.close();
});
