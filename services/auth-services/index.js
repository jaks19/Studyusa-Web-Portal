var authServices = {};

authServices.confirmUserCredentials = function confirmUserCredentials(req, res, next) {
    if (req.isAuthenticated() && req.params.username == req.user.username){ return next() }
    else if (req.isAuthenticated() && req.user.admin){ return next() }
    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}
    
module.exports = authServices;