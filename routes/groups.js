// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    groupServices = require('../services/group-services'),
    notifServices = require('../services/notif-services');
    
// Models
var Group = require("../models/group"),
    User = require("../models/user");

let router = express.Router({ mergeParams: true });

// Index
router.get('/', authServices.confirmUserCredentials, async function(req, res) {
    let groups = await dbopsServices.findAllEntriesAndPopulate(Group, { }, [ 'users' ], req, res),
        freeUsers = await dbopsServices.findAllEntriesAndPopulate(User, { 'group': 'noGroup' }, [ ], req, res);
    res.render('./admin/groups', {
        user: req.user,
        freeUsers: freeUsers,
        groups: groups,
        loggedIn: true,
        client: req.user
    });
});

// New Group
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let checkedUserIds = groupServices.getCheckedUsers(req, res),
        groupName = req.body.name, 
        newGroupData = new Group({ name: groupName }),
        groupEntry = await dbopsServices.createEntryAndSave(Group, newGroupData, req, res, false);
    for (var i = 0; i < checkedUserIds.length; i++) {
        let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [ ], req, res);
        checkedUserEntry.group = groupName;
        groupEntry.users.push(checkedUserEntry);
        notifServices.assignNotification(req.user.username, groupName, 'group-add', checkedUserEntry.username, req);
        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
    }
    dbopsServices.savePopulatedEntry(groupEntry, req, res);
    res.redirect('back');
});

// Add to Group
router.put('/:groupId', authServices.confirmUserCredentials, async function(req, res) {
    let checkedUserIds = groupServices.getCheckedUsers(req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users' ], req, res);
        
    for (var i = 0; i < checkedUserIds.length; i++) {
        let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [ ], req, res);
        checkedUserEntry.group = foundGroup.name;
        foundGroup.users.push(checkedUserEntry);
        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
        notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req);
    }

    dbopsServices.savePopulatedEntry(foundGroup, req, res);
    res.redirect('back');
});

// Remove someone from his/her group
router.get('/remove', authServices.confirmUserCredentials, async function(req, res) {
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ ], req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { 'name': foundUser.group }, [ ], req, res);
    foundUser.group = 'noGroup';
    dbopsServices.savePopulatedEntry(foundUser, req, res);
    notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req);
    if (foundGroup.users.length == 1) { await dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res) }
    else { foundGroup.users.pull(foundUser) }
    dbopsServices.savePopulatedEntry(foundGroup, req, res);
    res.redirect('back');
});

// Delete a Group
router.delete('/:groupId', authServices.confirmUserCredentials, async function(req, res) {
    let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { '_id': req.params.groupId }, [ ], req, res),
        foundUsers = await dbopsServices.findAllEntriesAndPopulate(User, { 'group': foundGroup.name }, [ ], req, res);
    for (var i = 0; i < foundUsers.length; i++) {
        let thisUser = foundUsers[i];
        thisUser.group = 'noGroup';
        dbopsServices.savePopulatedEntry(thisUser, req, res);
        notifServices.assignNotification(req.user.username, foundGroup.name, 'group-delete', thisUser.username, req);
    }
    await dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res);
    res.redirect('back');
});

module.exports = router;