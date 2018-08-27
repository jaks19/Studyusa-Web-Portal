// Shows modals for delete confirmation
// Interface:
// Buttons for delete need:
//    class='deletion' since other buttons are for post, get etc etc (may also have other classes tied in)
//    name='name' of the object being deleted e.g. task name, to use in the prompt
//    value='url' where to post the delete form,

let buttonPressed;

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

$('button').click(function(e){
    if ($(this).hasClass('deletion')) {
        buttonPressed = $(this);
        modalDelete.open();
        modalDelete.setContent(
            "<div>Are you sure you want to delete <b>" + $(this).attr('name') + "</b>?<div>"
        );
    }
});

modalDelete.addFooterBtn('Yes', 'tingle-btn tingle-btn--primary', function() {
    $('<form action="' + buttonPressed.val() + '" method="POST"></form>').appendTo('body').submit();
});

modalDelete.addFooterBtn('No', 'tingle-btn tingle-btn--danger', function() {
    modalDelete.close();
});
