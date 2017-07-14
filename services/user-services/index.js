var userServices = {};
let User = require("../../models/user"),
    notifServices = require('../notif-services'),
    dbOpsServices = require('../dbops-services'),
    apiServices = require('../api-services');

userServices.getUserData = async function getUserData(username, req, res) {
    var userData = {};
    userData.populatedUser = await dbOpsServices.findOneEntryAndPopulate(User, {'username': username}, ['submissions', 'notifs'], req, res),
    userData.allNotifs = userData.populatedUser.notifs.reverse(),
    userData.unseenNotifs = notifServices.getUnseenNotifs(userData.populatedUser.notifs),
    userData.firstContact = req.query.welcome ? true : false;
    if (userData.populatedUser.admin){
        userData.users = await dbOpsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res);
    } else {
        userData.articles = await apiServices.retrieveNews(req),
        userData.subs = userData.populatedUser.submissions.reverse();
    }
    return userData;
}

module.exports = userServices;