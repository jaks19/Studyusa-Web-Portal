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
