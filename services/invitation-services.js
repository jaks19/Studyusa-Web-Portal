const dbopsServices = require('./dbops-services');
const Invitation = require("../models/invitation");


let invitationServices = {};

invitationServices.generateCode = function generateCode(length) {
    let text = "";
    const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        let randomNumberZeroToOne = Math.random();
        let characterIndex = Math. floor(randomNumberZeroToOne * possibleCharacters.length);
        text += possibleCharacters.charAt(characterIndex)
    }
    return text;
}

invitationServices.garbageCollectInvitations = async function garbageCollectInvitations(garbageCollectDays) {
    let allInvitations = await dbopsServices.findAllEntriesAndPopulate(Invitation, { }, [ ], false);

    for (const thisInvitation of allInvitations) {
        let thisValidDate = new Date(thisInvitation.validUntil);
        let today = new Date(Date.now());
        let tooOldDateBoundary = (new Date()).setDate(today.getDate() - garbageCollectDays);

        if (thisValidDate < tooOldDateBoundary){
            await dbopsServices.findEntryByIdAndRemove(Invitation, thisInvitation._id);
        }
    };
    return;
}

invitationServices.getSortedInvitations = async function getSortedInvitations(){
    let invitations = await dbopsServices.findAllEntriesAndPopulate(Invitation, { }, [ ], true);
    let active = [];
    let expired = [];

    for (const thisInvitation of invitations) {
        if (dateValidHasBeenExceeded(thisInvitation)){ expired.push(thisInvitation) }
        else { active.push(thisInvitation) }
    }

    return [ active, expired ];
}

invitationServices.isValid = async function isValid(code, garbageCollect=true){

    // Quick fix to create a user, entry added to Trello for long-term feature TODO
    if (code == 190295) {return true}

    // Invalid if any of these true
    var invitation = await dbopsServices.findOneEntryAndPopulate(Invitation, { code: code }, [ ], true);
    if (!invitation) { return false }
    if (dateValidHasBeenExceeded(invitation)) { return false }

    // Invitation is Valid if reach here
    // Need to clear it? If being used, yeah.
    if(garbageCollect) { dbopsServices.findEntryByIdAndRemove(Invitation, invitation._id) }
    return true;
}

let dateValidHasBeenExceeded = function (invitation){

    let dateValid = new Date(invitation.validUntil);
    let today = new Date(Date.now());

    return dateValid < today;
}
module.exports = invitationServices;
