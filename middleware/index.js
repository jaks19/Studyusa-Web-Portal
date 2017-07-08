// File should contain all middleware functions used
// Referenced by require('./middleware') from app.js and by 
    // require('../middleware') in route files
// No need for /index.js as any package is looked up by its index.js file

var middlewareObj = {};

// Middleware to know if a user making a req is logged in or not
middlewareObj.isLoggedIn = 
    function isLoggedIn(req, res, next){
        if (req.isAuthenticated()){ // Fn from passport
            return next();
        }
        res.redirect('/login');
    }

// Middleware to verify if logged in user is an admin to access admin pages
middlewareObj.isAdmin = function isAdmin(req, res, next){
    if (req.user.admin){ // Fn from passport
        return next();
    } else {
        req.flash('error', 'You need to be logged in as Administrator to do that!')
    }
    res.redirect('/login');
}

// Takes in a list of Submissions and returns a list of submissions but ordered per folder
//  Just to meet specs of fileSubmissionHistory.ejs
//  (Wanted to return a map of folder to file but cannot in s=JS)
middlewareObj.sortSubs = function sortSubs(list){
    var subsSeen = [];
    var orderedSubs = []
    list.forEach(function(sub){
        var folder = sub['folder'];
        if (subsSeen.indexOf(folder) == -1){
            subsSeen.push(folder);
            list.forEach(function(s){
                if (s['folder'] == folder){
                    orderedSubs.push(s);
                }
            });
        }
        else{return;}
    });
    return orderedSubs;
}

module.exports = middlewareObj;