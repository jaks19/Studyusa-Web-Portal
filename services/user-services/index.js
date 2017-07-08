var userServices = {};
var User = require("../../models/user");

userServices.findUser = 
    function findUser(username) {
      return User.findOne({
        'username': username
      })
    }

userServices.findAllUsers = 
    function findAllUsers() {
      // find needs a callback acc to mongoose so we make this wrapper to give a promise instead
      return new Promise(function (resolve, reject) {
         User.find({}, function(error, users){
          if (error) { reject(error) }
          else { resolve(users) }
      });
     });
    }

userServices.renderAdminDashboard = 
    function renderAdminDashboard(res, users, loggedIn, populatedUser, allNotifs, unseenNotifs, format, firstContact) {
        res.render('./admin/dashboard', {
            users: users,
            user: populatedUser,
            client: populatedUser,
            notifs: allNotifs,
            unseenNotifs: unseenNotifs,
            format: format,
            firstContact: firstContact,
            loggedIn: loggedIn
        });
    }
    
userServices.renderUserDashboard = 
    function renderUserDashboard(res, subs, articles, loggedIn, populatedUser, allNotifs, unseenNotifs, format, firstContact) {
      res.render('show', {
            subs: subs,
            articles: articles,
            user: populatedUser,
            client: populatedUser,
            notifs: allNotifs,
            unseenNotifs: unseenNotifs,
            format: format,
            firstContact: firstContact,
            loggedIn: loggedIn
        });
    }

module.exports = userServices;



