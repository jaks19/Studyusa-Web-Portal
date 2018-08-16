var authServices = {};

// To be deprecated for confirmUserIdentity to use Id instead of username
authServices.confirmUserCredentials = function confirmUserCredentials(req, res, next) {
    if (req.isAuthenticated() && req.params.username == req.user.username){ return next() }
    else if (req.isAuthenticated() && req.user.admin){ return next() }
    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}

authServices.confirmUserIdentity = function confirmUserIdentity(req, res, next) {
    if (req.isAuthenticated() && req.params.userId == String(req.user._id)){ return next() }
    else if (req.isAuthenticated() && req.user.admin){ return next() }
    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}

authServices.isAdmin = function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin){ return next() }
    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}

module.exports = authServices;
