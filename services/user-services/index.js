var userServices = {};

// Models
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
    
// userServices.renderUserPage = 
//     function renderUserPage(username, populatedUser, allNotifs, unseenNotifs, loggedIn=false, users=[], , ) {
//       return User.findOne({
//         'username': username
//       })
//     }
    
module.exports = userServices;