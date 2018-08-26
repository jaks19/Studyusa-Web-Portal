var express = require("express"),
    passport = require('passport');

var router = express.Router();

router.post('/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/index',
    }), function(req, res) {
        var user = req.user;
        res.redirect('/index/' + user.username + '?welcome=yes');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/index');
});

module.exports = router;
