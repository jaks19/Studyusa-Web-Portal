const express = require("express");
const format = require('../text/notifJson');

const authServices = require('../services/auth-services');
const notifServices = require('../services/notif-services');
const dbopsServices = require('../services/dbops-services');

const Notif = require("../models/notif");
const User  = require("../models/user");


var router = express.Router({ mergeParams: true });

// View Notifs
router.get('/', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username' : req.params.username }, [ 'notifs' ], true);
        let [unseenNotifs, seenNotifs] = notifServices.getBothSeenAndUnseenNotifs(foundUser.notifs);

        res.render('notifs', {
            user: foundUser,
            loggedIn: true,
            format: format,
            unseenNotifs: unseenNotifs.reverse(),
            seenNotifs: seenNotifs.reverse(),
            client: foundUser
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }

});

// Notif Toggling seen-unseen TODO: Dragula
router.put('/:notifId', authServices.confirmUserCredentials, async function(req, res) {
    try {
        let foundNotif = await dbopsServices.findOneEntryAndPopulate(Notif, { '_id': req.params.notifId }, [], false);
        foundNotif.seen = !foundNotif.seen;
        dbopsServices.savePopulatedEntry(foundNotif);
    }
    catch (error) {
        req.flash('error', error.message);
    }

    res.redirect('back');
});

module.exports = router;
