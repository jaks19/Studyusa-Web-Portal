var userServices = {};
let User = require("../../models/user"),
    notifServices = require('../notif-services'),
    dbOpsServices = require('../dbops-services'),
    apiServices = require('../api-services');


userServices.findUser = function findUser(username) {
    return User.findOne({'username': username});
}
        
function getPromiseToFindAllUsers() {
    // find needs a callback acc to mongoose so we make this wrapper to give a promise instead
    return new Promise(function (resolve, reject) {
        User.find({}, function(error, users){
            if (error) { reject(error) }
            else { resolve(users) }
        });
    });
}

userServices.findAllUsers = async function findAllUsers(req) {
     try {  
         return await getPromiseToFindAllUsers(); 
     } catch (err) { 
         req.flash('error', 'Cannot populate all users') 
     } 
}
    

userServices.getUserData = async function getUserData(username, req, res) {
    let foundUser = userServices.findUser(username);
    var userData = {};
    userData.populatedUser = await dbOpsServices.populateEntry(foundUser, ['submissions', 'notifs'], req, res);
    userData.allNotifs = userData.populatedUser.notifs.reverse(),
    userData.unseenNotifs = notifServices.getUnseenNotifs(userData.populatedUser.notifs),
    userData.firstContact = req.query.welcome ? true : false;
    
    if (userData.populatedUser.admin){
        userData.users = await userServices.findAllUsers(req);
    } else {
        userData.articles = await apiServices.retrieveNews(req),
        userData.subs = userData.populatedUser.submissions.reverse()
    }
    return userData;
}
    
module.exports = userServices;