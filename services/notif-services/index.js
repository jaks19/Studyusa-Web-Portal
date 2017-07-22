var notifServices = {};

let Notif = require('../../models/notif'),
    User = require('../../models/user'),
    dbopsServices = require('../dbops-services');

notifServices.getBothSeenAndUnseenNotifs = function getBothSeenAndUnseenNotifs(notifs) {
  let seenNotifs = [],
      unseenNotifs = [];
  notifs.slice(0).forEach(function(notif){
    if (notif.seen){ seenNotifs.push(notif) } 
    else { unseenNotifs.push(notif) }
  });
  return [seenNotifs, unseenNotifs];
}

async function assignNotif(doerAccountUserName, nameOfTheConcernedObjectChangedOrCreatedOrDeleted, eventStringInNotifJson, receivingAccountUsername, req, res) {
    let notifData = new Notif({ causerName: doerAccountUserName, objectName: nameOfTheConcernedObjectChangedOrCreatedOrDeleted, event: eventStringInNotifJson }),
        newNotif = await dbopsServices.createEntryAndSave(Notif, notifData, req, res),
        userCriteria = {};
    if (receivingAccountUsername == 'admin') { userCriteria = { 'admin': true } }
    else { userCriteria = { 'username': receivingAccountUsername } }
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, userCriteria, [ ], req, res);
    foundUser.notifs.push(newNotif);
    dbopsServices.savePopulatedEntry(foundUser, req, res);
};

notifServices.assignNotification = async function assignNotification(doerAccountUserName, objectName, eventString, receivingAccountUsername, req, res) {
    // Admin to Client
    if (doerAccountUserName != receivingAccountUsername) { await assignNotif(doerAccountUserName, objectName, eventString, receivingAccountUsername, req, res) } 
    // Client to Admin
    else { await assignNotif(doerAccountUserName, objectName, eventString, 'admin', req, res) }
}
   
module.exports = notifServices;