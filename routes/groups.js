// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    groupServices = require('../services/group-services'),
    notifServices = require('../services/notif-services'),
    userServices = require('../services/user-services'),
    format = require('../notifJson');

// Models
var Group = require("../models/group"),
    User = require("../models/user"),
    Message = require("../models/comment");

let router = express.Router({ mergeParams: true });

// Index
router.get('/', authServices.confirmUserCredentials, async function(req, res) {
    let groups = await dbopsServices.findAllEntriesAndPopulate(Group, { }, [ 'users' ], req, res),
        freeUsers = await dbopsServices.findAllEntriesAndPopulate(User, { 'group': null }, [ ], req, res),
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res);

    res.render('./admin/groupsX', {
        user: req.user,
        freeUsers: freeUsers,
        users: users,
        groups: groups,
        loggedIn: true
    });
});


// New Group
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let checkedUserIds = groupServices.getCheckedUsers(req, res)[0],
        groupName = req.body.name,
        newGroupData = new Group({ name: groupName }),
        groupEntry = await dbopsServices.createEntryAndSave(Group, newGroupData, req, res, false);
    for (var i = 0; i < checkedUserIds.length; i++) {
        let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [ ], req, res);
        checkedUserEntry.group = groupEntry;
        groupEntry.users.push(checkedUserEntry);
        notifServices.assignNotification(req.user.username, groupName, 'group-add', checkedUserEntry.username, req, res);
        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
    }
    dbopsServices.savePopulatedEntry(groupEntry, req, res);
    res.redirect('back');
});

// Add to Group
router.put('/:groupId/add', authServices.confirmUserCredentials, async function(req, res) {
    let [incomingIds, outgoingIds] = groupServices.getCheckedUsers(req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users' ], req, res);

    console.log(incomingIds, outgoingIds);

    if(typeof incomingIds[0] !== "undefined")
    {
        console.log('NOOOO')
        for (var i = 0; i < incomingIds.length; i++) {
            let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': incomingIds[i] }, [ ], req, res);
            checkedUserEntry.group = foundGroup;
            dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
            foundGroup.users.push(checkedUserEntry);
            notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
            dbopsServices.savePopulatedEntry(foundGroup, req, res);
        }
    }

    if(typeof outgoingIds[0] !== "undefined")
    {
        for (var i = 0; i < outgoingIds.length; i++) {
            let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { '_id': outgoingIds[i] }, [ ], req, res);
            await dbopsServices.updateEntryAndSave(User, { '_id': outgoingIds[i] }, { $unset: {"group": null}});
            notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req, res);
            foundGroup.users.pull(foundUser);
            dbopsServices.savePopulatedEntry(foundGroup, req, res);
        }
    }

    res.redirect('back');

});

// See group messages
router.get('/:groupId/messages', authServices.confirmUserCredentials, async function(req, res) {
    let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users', 'messages' ], req, res),
        foundClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

    res.render('groupMessages', { group: foundGroup, messages: foundGroup['messages'], loggedIn: true, user: req.user, users: foundGroup.users, client: foundClient });
});

// post  group message
router.post('/:groupId/messages', authServices.confirmUserCredentials, async function(req, res) {
    let sender = req.user,
        oneClient = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ 'group' ], req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { '_id': req.params.groupId }, [ 'users' ], req, res),
        newM = new Message({ username: sender.username, content: req.body.textareacontent }),
        newMessage = await dbopsServices.createEntryAndSave(Message, newM, req, res);
        foundGroup.messages.push(newMessage);
        dbopsServices.savePopulatedEntry(foundGroup, req, res);
        foundGroup.users.forEach(function(receiver) {
            notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver.username, req, res);
        });
        res.redirect('back');
});





// See a specific Group's members
router.get('/:groupId', authServices.confirmUserCredentials, async function(req, res) {
    let username = req.params.username,
        userData = await userServices.getUserData(username, req, res);

    res.render('./admin/dashboard', {
        user: userData.populatedUser,
        users: userData.users,
        client: userData.populatedUser,
        notifs: userData.allNotifs,
        unseenNotifs: userData.unseenNotifs,
        format: format,
        activeInvitations: userData.activeInvitations,
        expiredInvitations: userData.expiredInvitations,
        context: userData.context,
        // This is exactly the traditional admin dashboard, except the users with groupId
        // provided are pre-loaded and presented to the screen first.
        // This is the /index/username/groups/groupid/ get page is.
        groupId: req.params.groupId,
        loggedIn: true
    });
});

// Delete a Group
router.delete('/:groupId', authServices.confirmUserCredentials, async function(req, res) {
    let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { '_id': req.params.groupId }, [ 'users' ], req, res);

    for (var i = 0; i < foundGroup.users.length; i++) {
        await dbopsServices.updateEntryAndSave(User, { 'username': foundGroup.users[i].username }, { $unset: {"group": null}})
        // Notif not created properly, throws a flash card (red)
        notifServices.assignNotification(req.user.username, foundGroup.name, 'group-delete', foundGroup.users[i].username, req, res);
    }
    await dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res);
    res.redirect('back');
});

module.exports = router;
