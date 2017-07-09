var notifServices = {};

let helpers = require('../../helpers');

notifServices.getUnseenNotifs = function getUnseenNotifs(notifs) {
  var unseenNotifs = [];
  notifs.slice(0).forEach(function(notif) {
    if (!notif.seen) {
        unseenNotifs.push(notif);
    }
  });
  return unseenNotifs;
}

notifServices.assignNotification = function assignNotification(doerAccountUserName, objectName, eventString, receivingAccountUsername, req) {
  if (doerAccountUserName != receivingAccountUsername) {
    helpers.assignNotif(doerAccountUserName, objectName, eventString, receivingAccountUsername, req);
  } else {
    // only user to user, no admin to admin
    helpers.assignNotif(doerAccountUserName, objectName, eventString, 'admin', req);
  }
}
   
module.exports = notifServices;