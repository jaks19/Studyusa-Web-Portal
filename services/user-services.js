var userServices = {};
let User = require("../models/user"),
    Invitation = require("../models/invitation"),
    notifServices = require('./notif-services'),
    dbOpsServices = require('./dbops-services'),
    apiServices = require('./api-services'),
    invitationServices = require('./invitation-services');

function userPageContext(req) {
    let context = '';
    if (req.query.welcome) { context = 'justLoggedIn' }
    else if (req.query.invitation) { context = 'invitation' }
    return context;
}

userServices.registerUser = function registerUser(makeAdmin=false, req) {
    let newUserObject = new User({
        name: req.body.name,
        username: req.body.username,
        admin: makeAdmin
    });

    return new Promise(function (resolve, reject) {
        User.register(newUserObject, req.body.password, function(error){
            if (error) { reject(error) }
            else { resolve()}
        });
     });
}

userServices.getUserData = async function getUserData(username, req, res) {
    var userData = {};
    userData.populatedUser = await dbOpsServices.findOneEntryAndPopulate(User, {'username': username}, ['notifs', 'tasks', 'group'], req, res);
    userData.allNotifs = userData.populatedUser.notifs.reverse();
    userData.unseenNotifs = notifServices.getBothSeenAndUnseenNotifs(userData.populatedUser.notifs)[1];
    userData.context = userPageContext(req);
    if (userData.populatedUser.admin){
        userData.users = await dbOpsServices.findAllEntriesAndPopulate(User, { }, ['group'], req, res);
        [ userData.activeInvitations, userData.expiredInvitations ] = await invitationServices.getSortedInvitations(req, res);
    } else {
        userData.articles = await apiServices.retrieveNews(req);
    }

    userData.populatedUser.lastLoggedIn = Date.now();
    dbOpsServices.savePopulatedEntry(userData.populatedUser, req, res);

    return userData;
}

module.exports = userServices;
