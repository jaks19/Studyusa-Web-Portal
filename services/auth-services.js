var authServices = {};

// /index/:username/... => Check if the signed in user's username matches the one in the route
authServices.confirmUserCredentials = function confirmUserCredentials(req, res, next) {
    if (req.isAuthenticated() && req.params.username == req.user.username){ return next() }

    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}

// If accessing index/:username/.../:userId
// Checks if viewer (from :username) matched _if from (userId)
// Unless viewer is an admin then permission granted as well
authServices.confirmUserIdentity = function confirmUserIdentity(req, res, next) {
    if (req.isAuthenticated() && req.params.userId == String(req.user._id)){ return next() }
    else if (req.isAuthenticated() && req.user.admin){ return next() }

    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}

// For admin-only pages
authServices.isAdmin = function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }

    req.flash('error', 'You do not have the required permissions to view this page');
    res.redirect('/login');
}

module.exports = authServices;
