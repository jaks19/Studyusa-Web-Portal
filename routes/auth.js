// Packages
var express = require("express"),
    passport = require('passport');

// To be Exported
var router = express.Router(); // To allow linking routing from this file to router (For cleaner code)

// Login - POST
router.post('/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/index',
    }),
    function(req, res) {
        var user = req.user;
        if (user.admin) { res.redirect('/index/' + 'admin' + '?welcome=yes') }
        else { res.redirect('/index/' + user.username + '?welcome=yes') }
    });

// Logout
router.get('/logout', function(req, res) {
    // Takes a user who clicked on 'log out' to the index. Logs him/her out.
    req.logout();
    res.redirect('/index');
});

module.exports = router;