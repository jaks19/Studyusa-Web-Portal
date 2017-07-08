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
helperObj.assignNotif = function assignNotif(causerName, objectName, eventString, receiverId) {
    var notif = new Notif({
        causerName: causerName,
        objectName: objectName,
        event: eventString,
    });

    Notif.create(notif, function(err, newNotif) {
        if (err) {
            console.log('Notif did not go through');
        }
        else {
            if (receiverId == 'admin') {
                User.findOne({
                    'admin': true
                }, function(error, foundUser) {
                    foundUser.notifs.push(newNotif);
                    foundUser.save(function(Err) {
                        if (Err) {
                            console.log('Notif did not go through');
                        }
                        else {
                            console.log('Associated notification was created for admin');
                            console.log(newNotif);
                        }
                    });
                });
            }
            else {
                User.findById(receiverId, function(error, foundUser) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        foundUser.notifs.push(newNotif);
                        foundUser.save(function(Err) {
                            if (Err) {
                                console.log('Notif did not go through');
                            }
                            else {
                                console.log('Associated notification was created');
                                console.log(newNotif);
                            }
                        });
                    }
                });
            }

        }
    });
};

module.exports = helperObj;