// Shows a modal with a message and need to press ok to proceed woth no further logic
// Interface:
// Need a button with class='message-button' to be pressed and the button has an attribute called 'message' that has the message to be displayed

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
    if ($(this).hasClass('message-button')) {

        let buttonChosen = $(this);
        let hiddenMessage = buttonChosen.attr('message');
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
