var authServices = {};

authServices.confirmCredentials = 
    function confirmCredentials(username, req, res) {
      if (username != req.user.username){
        req.flash('error', 'You do not have the required permissions to view this page');
        res.redirect('back');
        return false;
      } else {
        return true;
      }
    }
    
module.exports =authServices;