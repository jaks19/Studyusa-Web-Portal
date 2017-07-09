// File should contain all helper functions used
// Referenced by require('./helpers') from app.js and by 
// require('../helpers') in route files
// No need for /index.js as any package is looked up by its index.js file
var
    Notif = require('../models/notif'),
    User = require('../models/user');
var helperObj = {};

// Takes in a causerId, an objectId and an eventString, creates the notif
// Also takes in the receiverId (id of person who will see thenotif) and saves the notif in its records
helperObj.assignNotif = function assignNotif(doerAccountUserName, nameOfTheConcernedObjectChangedOrCreatedOrDeleted, eventStringInNotifJson, receivingAccountUsername, req) {
    var notif = new Notif({
        causerName: doerAccountUserName,
        objectName: nameOfTheConcernedObjectChangedOrCreatedOrDeleted,
        event: eventStringInNotifJson,
    });

    Notif.create(notif, function(err, newNotif) {
        if (err) {
            req.flash('error', 'Could not create a notification for this change!');
        }
        else {
            if (receivingAccountUsername == 'admin') {
                User.findOne({
                    'admin': true
                }, function(error, foundUser) {
                    foundUser.notifs.push(newNotif);
                    foundUser.save(function(Err) {
                        if (Err) {
                            req.flash('error', 'Could not create a notification for this change!');
                        }
                    });
                });
            }
            else {
                User.findOne({'username': receivingAccountUsername}, function(error, foundUser) {
                    if (error) {
                        req.flash('error', 'Could not create a notification for this change!');
                    }
                    else {
                        foundUser.notifs.push(newNotif);
                        foundUser.save(function(Err) {
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

module.exports = helperObj;