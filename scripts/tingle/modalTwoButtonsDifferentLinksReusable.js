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
