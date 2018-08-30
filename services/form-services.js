var formServices = {};

// multiparty allows parsing forms where files are uploaded
let multiparty = require("multiparty");

// Parses a form with input fields of specific names using multiparty package
// Returns a Promise to parse the form and return an array of two objects:
// [ fields, files ]
//
// fields['fieldName'] maps to value entered in the input box names 'fieldName'
// files['fileFieldName'] gets the file uploaded in an input box named 'fileFieldName'
formServices.getPromiseToParseForm = function getPromiseToParseForm(req) {
    // form.parse needs a callback so we make this wrapper to give back a promise instead
    return new Promise(function (resolve, reject) {
        let form = new multiparty.Form();

        form.parse(req, function(error, fields, files){
            if (error) { reject(error) }
            else { resolve([ fields, files ]) }
        });
    });
}

// Parses a form in req with checkboxes
// Checkboxes are grouped under common names
// They each hold a different value
//
// Returns an object with names, (names provided by user in an array of Strings)
// and each name is mapped to an array of values pertaining to values of checkboxes
// that were checked, and that were grouped under this name
// If none of a name is checked, returns an empty array at that name
formServices.getCheckedValuesByName = function getCheckedValuesByName(names, req) {
    let nameToArrayOfValues = {}

    for (var i = 0; i < names.length; i++) {
        let name = names[i];

        // None of that name selected
        if (typeof req.body[name] === "undefined"){ nameToArrayOfValues[name] = [] }
        // Only one selected of that name
        else if (!Array.isArray(req.body[name])) { nameToArrayOfValues[name] = [req.body[name]] }
        // More than one selected
        else { nameToArrayOfValues[name] = req.body[name] }

        console.log(nameToArrayOfValues);
    }
    return nameToArrayOfValues;
}

module.exports = formServices;
