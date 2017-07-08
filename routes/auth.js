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
        var username = req.body.username;
        res.redirect('/index/' + username + '?welcome=yes');
    });

// Logout
router.get('/logout', function(req, res) {
    // Takes a user who clicked on 'log out' to the index. Logs him/her out.
    req.logout();
    res.redirect('/index');
});

module.exports = router;