const Notif = require('../models/notif');
const User = require('../models/user');
const dbopsServices = require('./dbops-services');


var notifServices = {};

notifServices.getBothSeenAndUnseenNotifs = function getBothSeenAndUnseenNotifs(notifs) {
  let seenNotifs = [];
  let unseenNotifs = [];

  notifs.forEach(function(notif){
    if (notif.seen) { seenNotifs.push(notif) }
    else { unseenNotifs.push(notif) }
  });

  return [ seenNotifs, unseenNotifs ];
}


async function assignNotif(doerAccountUserName, theAffectedObject, eventDenoterInNotifJsonFile, receivingAccountUsername) {

    let notifData = new Notif({ causerName: doerAccountUserName, objectName: theAffectedObject, event: eventDenoterInNotifJsonFile });
    let newNotif = await dbopsServices.savePopulatedEntry(notifData);

    let userCriteria = {};
    if (receivingAccountUsername == 'admin') { userCriteria = { 'admin': true } }
    else { userCriteria = { 'username': receivingAccountUsername } }

    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, userCriteria, [ ], false);
    foundUser.notifs.push(newNotif);
    dbopsServices.savePopulatedEntry(foundUser); // Run async

    return;
};

notifServices.assignNotification = async function assignNotification(doerAccountUserName, objectName, eventString, receivingAccountUsername) {
    // Admin to Client
    if (doerAccountUserName != receivingAccountUsername) { await assignNotif(doerAccountUserName, objectName, eventString, receivingAccountUsername) }
    // Client to Admin
    else { await assignNotif(doerAccountUserName, objectName, eventString, 'admin') }
}

module.exports = notifServices;

// TODO: Need to remove the hardcoding of admin and belief that there is just one admin that should receive the notification
// TODO: Make possible passing an array of receivers so that do not have to loop to assign notifications when receivers are more than 1
