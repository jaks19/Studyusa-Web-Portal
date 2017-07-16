'use strict';

var notifServices = {};

var Notif = require('../../models/notif'),
    User = require('../../models/user');

notifServices.getUnseenNotifs = function getUnseenNotifs(notifs) {
    var unseenNotifs = [];
    notifs.slice(0).forEach(function (notif) {
        if (!notif.seen) {
            unseenNotifs.push(notif);
        }
    });
    return unseenNotifs;
};

notifServices.getBothSeenAndUnseenNotifs = function getBothSeenAndUnseenNotifs(notifs) {
    var seenNotifs = [],
        unseenNotifs = [];
    notifs.slice(0).forEach(function (notif) {
        if (notif.seen) {
            seenNotifs.push(notif);
        } else {
            unseenNotifs.push(notif);
        }
    });
    return [seenNotifs, unseenNotifs];
};

function assignNotif(doerAccountUserName, nameOfTheConcernedObjectChangedOrCreatedOrDeleted, eventStringInNotifJson, receivingAccountUsername, req) {
    var notifData = new Notif({ causerName: doerAccountUserName, objectName: nameOfTheConcernedObjectChangedOrCreatedOrDeleted, event: eventStringInNotifJson });
    Notif.create(notifData, function (err, newNotif) {
        if (err) {
            req.flash('error', 'Could not create a notification for this change!');
        } else {
            if (receivingAccountUsername == 'admin') {
                User.findOne({
                    'admin': true
                }, function (error, foundUser) {
                    foundUser.notifs.push(newNotif);
                    foundUser.save(function (Err) {
                        if (Err) {
                            req.flash('error', 'Could not create a notification for this change!');
                        }
                    });
                });
            } else {
                User.findOne({ 'username': receivingAccountUsername }, function (error, foundUser) {
                    if (error) {
                        req.flash('error', 'Could not create a notification for this change!');
                    } else {
                        foundUser.notifs.push(newNotif);
                        foundUser.save(function (Err) {
                            if (Err) {
                                req.flash('error', 'Could not create a notification for this change!');
                            }
                        });
                    }
                });
            }
        }
    });
};

notifServices.assignNotification = function assignNotification(doerAccountUserName, objectName, eventString, receivingAccountUsername, req) {
    if (doerAccountUserName != receivingAccountUsername) {
        assignNotif(doerAccountUserName, objectName, eventString, receivingAccountUsername, req);
    } else {
        // only user to user, no admin to admin
        assignNotif(doerAccountUserName, objectName, eventString, 'admin', req);
    }
};

module.exports = notifServices;
//# sourceMappingURL=index.js.map