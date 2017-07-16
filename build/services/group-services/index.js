'use strict';

var groupServices = {};

groupServices.getCheckedUsers = function getCheckedUsers(req, res) {
    if (req.body.chk == null) {
        req.flash('error', "Error, group not created! You did not choose any user to add to that group upon creating it!");
        return res.redirect('back');
    }
    var checkedUsers;
    if (!Array.isArray(req.body.chk)) {
        checkedUsers = [req.body.chk];
    } else {
        checkedUsers = req.body.chk;
    }
    return checkedUsers;
};

module.exports = groupServices;
//# sourceMappingURL=index.js.map