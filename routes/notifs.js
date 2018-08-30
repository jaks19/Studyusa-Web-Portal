// Packages
let express = require("express"),
    authServices = require('../services/auth-services'),
    notifServices = require('../services/notif-services'),
    dbopsServices = require('../services/dbops-services');

// Models
let Notif = require("../models/notif"),
    User  = require("../models/user"),
    format = require('../text/notifJson');

// To be Exported
var router = express.Router({ mergeParams: true });

// View Notifs
router.get('/', authServices.confirmUserCredentials, async function(req, res) {
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username' : req.params.username }, [ 'notifs' ], true),
        [unseenNotifs, seenNotifs] = notifServices.getBothSeenAndUnseenNotifs(foundUser.notifs);

        res.render('notifs', {
            user: foundUser,
            loggedIn: true,
            format: format,
            unseenNotifs: unseenNotifs.reverse(),
            seenNotifs: seenNotifs.reverse(),
            client: foundUser
        });
});

// Notif Toggling seen-unseen
router.get('/:id/toggle', authServices.confirmUserCredentials, async function(req, res) {
    let foundNotif = await dbopsServices.findOneEntryAndPopulate(Notif, { '_id': req.params.id }, [], false);
    foundNotif.seen = !foundNotif.seen;
    dbopsServices.savePopulatedEntry(foundNotif);
    res.redirect('back');
});

module.exports = router;
