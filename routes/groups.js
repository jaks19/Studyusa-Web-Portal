// /index/:username/groups

// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    helpers = require('../helpers');

// Models
var Group = require("../models/group"),
    User = require("../models/user");

// To be Exported
var router = express.Router({
    mergeParams: true
}); // To allow linking routing from this file to app (For cleaner code)

// Index
router.get('/', authServices.confirmUserCredentials, function(req, res) {
    Group.find({}).populate('users').exec(function(error, groups) {
        if (error) {
            req.flash('error', 'Could not retrieve groups!');
            res.redirect('back');
        }
        else {
            User.find({
                'group': 'noGroup'
            }, function(error, freeUsers) {
                if (error) {
                    req.flash('error', 'Could not retrieve users who are not in groups yet');
                    res.redirect('back');
                }
                else {
                    User.findOne({
                        'username' : req.params.username
                    }, function(error, foundUser){
                        if (error){
                            req.flash('error', 'Error! Could not locate some records.')
                        } else {
                            res.render('./admin/groups', {
                                user: req.user,
                                freeUsers: freeUsers,
                                groups: groups,
                                loggedIn: true,
                                client: foundUser
                            });
                        }
                    })
                    
                }
            });
        }
    });
});

// New Group - POST
router.post('/', authServices.confirmUserCredentials, function(req, res) {
    // Look at all the checkboxes and get the users who were checked
    var checked;
    if (req.body.chk == null){
        req.flash('error', "Error, group not created! You did not choose any user to add to that group upon creating it!");
        return res.redirect('back');
    }
    if (!Array.isArray(req.body.chk)) {
        checked = [req.body.chk];
    }
    else {
        checked = req.body.chk;
    }
    var checkedIterables = checked.slice(0);
    var checkedUsers = new Array();
    checkedIterables.forEach(function(userchecked) {
        User.findOne({
            '_id': userchecked
        }, function(error, foundUser) {
            if (error) {
                req.flash('error', 'Error finding user with id: ' + userchecked + ' to add to group!');
            }
            else {
                checkedUsers.push(foundUser);
            }
        });
    });

    // Create the group with the checked users
    var newGroup = new Group({
        name: req.body.name
    });
    Group.create(newGroup, function(Err, groupData) {
        if (Err) {
            req.flash('error', 'Could not create group!');
        }
        else {
            groupData.users = checkedUsers.slice(0);
            groupData.save(function(e, savedGroup) {
                if (e) {
                    req.flash('error', 'Could not save this new group!');
                }
                else {
                    // Cache the group name to the user entries
                    checkedUsers.forEach(function(user) {
                        user.group = savedGroup.name;
                        user.save(function(e, savedUser) {
                            if (e) {
                                req.flash('error', 'Could not save user: ' + user.username + ' into this new group!');
                            }
                            else {
                                req.flash('success', 'Group successfully created! Scroll down to find it!');
                                helpers.assignNotif(req.user.username, savedGroup.name, 'group-add', user._id, req);
                            }
                        });
                    });
                    res.redirect('back');
                }
            });
        }
    });
});

// Delete a Group - DELETE
router.delete('/:groupId', authServices.confirmUserCredentials, function(req, res) {
    var groupId = req.params.groupId;
    // Find users with this group and remove the reference
    Group.findOne({
        '_id': groupId
    }, function(error, foundGroup) {
        if (error) {
            req.flash('error', 'Could not retrieve group!');
            return res.redirect('back');
        }
        else {
            var groupName = foundGroup.name;
            User.find({
                'group': groupName
            }, function(error, foundUsers) {
                if (error) {
                    req.flash('error', 'Could not retrieve group users to free them!');
                    return res.redirect('back');
                }
                else {
                    foundUsers.forEach(function(user) {
                        user.group = 'noGroup';
                        user.save(function(error) {
                            if (error) {
                                req.flash('error', 'Could not set the users free!');
                                return res.redirect('back');
                            }
                            else {
                                helpers.assignNotif(req.user.username, foundGroup.name, 'group-remove', user._id, req);
                            }
                        });
                    });
                    Group.findByIdAndRemove(groupId, function(error) {
                        if (error) {
                            req.flash('error', 'Could not delete group!');
                            return res.redirect('back');
                        }
                        else {
                            res.redirect('/index/' + req.user.username + '/groups/');
                        }
                    });
                }
            });
        }
    });
});

// Remove someone from his/her group - PUT
router.get('/remove', authServices.confirmUserCredentials, function(req, res) {
    var username = req.params.username;
    // Find user, remove its group ref and remove it from group obj
    User.findOne({
        'username': username
    }, function(error, foundUser) {
        if (error) {

        }
        else {
            var groupRecord = foundUser.group;
            foundUser.group = 'noGroup';
            foundUser.save(function(error) {
                if (error) {
                }
                else {
                    Group.findOne({
                        'name': groupRecord
                    }, function(error, foundGroup) {
                        if (error) {

                        }
                        else {
                            
                            helpers.assignNotif(req.user.username, foundGroup.name, 'group-remove', foundUser._id, req);
                            
                            if (foundGroup.users.length == 1) {
                                Group.findByIdAndRemove(foundGroup._id, function(error) {
                                    if (error) {

                                    }
                                });
                            }
                            else {
                                foundGroup.users.pull(foundUser);
                                foundGroup.save(function(error) {
                                    if (error) {

                                    }
                                });
                            }
                            res.redirect('/index/' + req.user.username + '/groups/');
                        }
                    });
                }
            });
        }
    });
});

// Add to Group - PUT
router.put('/:groupId', authServices.confirmUserCredentials, function(req, res) {
    // Look at all the checkboxes and get the users who were checked
    var checked;
    if (req.body.chk == null){
        req.flash('error', "Error, you did not choose any person to add to that group!");
        return res.redirect('back');
    }
    if (!Array.isArray(req.body.chk)) {
        checked = [req.body.chk];
    }
    else {
        checked = req.body.chk;
    }
    var checkedIterables = checked.slice(0);
    var checkedUsers = new Array();
    checkedIterables.forEach(function(userchecked) {
        User.findOne({
            '_id': userchecked
        }, function(error, foundUser) {
            if (error) {
                req.flash('error', 'Error finding user with id: ' + userchecked + ' to add to group!');
            }
            else {
                checkedUsers.push(foundUser);
            }
        });
    });

    // Create the group with the checked users
    Group.findById(req.params.groupId).populate('users').exec(function(Err, foundGroup) {
        if (Err) {
            req.flash('error', "Could not locate that group's records!");
        }
        else {
            var checkedCopy = checkedUsers.slice(0);
            checkedCopy.forEach(function(usr) {
                foundGroup.users.push(usr);
            });

            foundGroup.save(function(e) {
                if (e) {
                    req.flash('error', 'Could not save the new data for this group!');
                }
                else {
                    // Cache the group name to the user entries
                    checkedUsers.forEach(function(user) {
                        user.group = foundGroup.name;
                        user.save(function(e) {
                            if (e) {
                                req.flash('error', 'Could not save user: ' + user.username + ' into this new group!');
                            }
                            else {
                                req.flash('success', 'Group successfully created! Scroll down to find it!');
                                helpers.assignNotif(req.user.username, foundGroup.name, 'group-add', user._id, req);
                                
                            }
                        });
                    });
                    res.redirect('back');
                }
            });
        }
    });
});

module.exports = router;
