
const notifServices = require('./notif-services');
const dbopsServices = require('./dbops-services');
const apiServices = require('./api-services');
const invitationServices = require('./invitation-services');

const User = require("../models/user");
const Invitation = require("../models/invitation");

let userServices = {};

function userPageContext(req) {
    let context = '';
    if (req.query.welcome) { context = 'justLoggedIn' }
    else if (req.query.invitation) { context = 'invitation' }
    return context;
}

userServices.registerUser = function registerUser(makeAdmin=false, req) {
    return new Promise(function (resolve, reject) {
        let newUserObject = new User({
            name: req.body.name,
            username: req.body.username,
            admin: makeAdmin
        });

        User.register(newUserObject, req.body.password, function(error){
            if (error) { reject(error) }
            else { resolve()}
        });
     });
}

userServices.loadUserData = async function loadUserData(username, req) {
    let userData = {};
    
    userData.populatedUser = await dbopsServices.findOneEntryAndPopulate(User, {'username': username}, ['notifs', 'tasks', 'group'], false);
    userData.allNotifs = userData.populatedUser.notifs.reverse();
    userData.unseenNotifs = notifServices.getBothSeenAndUnseenNotifs(userData.populatedUser.notifs)[1];
    userData.pageContext = userPageContext(req);

    if (userData.populatedUser.admin){
        userData.users = await dbopsServices.findAllEntriesAndPopulate(User, { }, ['group'], true);
        [ userData.activeInvitations, userData.expiredInvitations ] = await invitationServices.getSortedInvitations();
        userData.groupToLoad = req.query.groupId || -1;
    }

    else {  userData.articles = await apiServices.retrieveNews() }

    return userData;
}

userServices.updateLastLoggedIn = async function updateLastLoggedIn(user) {
    user.lastLoggedIn = Date.now();
    await dbopsServices.savePopulatedEntry(user);
}

module.exports = userServices;
