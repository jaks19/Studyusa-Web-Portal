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
    Commentary = require("../models/commentary");

let router = express.Router({ mergeParams: true });

// Index
router.get('/', authServices.confirmUserCredentials, async function(req, res) {
    let groups = await dbopsServices.findAllEntriesAndPopulate(Group, { }, [ 'users' ], req, res),
        freeUsers = await dbopsServices.findAllEntriesAndPopulate(User, { 'group': null }, [ ], req, res),
        users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], req, res);

    res.render('./admin/groups', {
        user: req.user,
        freeUsers: freeUsers,
        users: users,
        groups: groups,
        loggedIn: true
    });
});


// New Group
router.post('/', authServices.confirmUserCredentials, async function(req, res) {
    let groupData = groupServices.getCheckedUsers(req, res);

    if(typeof groupData !== "undefined") {
        let groupName = req.body.name,
            newGroupData = new Group({ name: groupName }),
            groupEntry = await dbopsServices.savePopulatedEntry(newGroupData, req, res);

        let checkedUserIds = groupServices.getCheckedUsers(req, res)[0];
        for (var i = 0; i < checkedUserIds.length; i++) {
            let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [ ], req, res);
            checkedUserEntry.group = groupEntry;
            groupEntry.users.push(checkedUserEntry);
            notifServices.assignNotification(req.user.username, groupName, 'group-add', checkedUserEntry.username, req, res);
            dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
        }
        dbopsServices.savePopulatedEntry(groupEntry, req, res);
        res.redirect('back');
    }
    else return;
});


// Add/remove to Group
router.put('/:groupId/add', authServices.confirmUserCredentials, async function(req, res) {
    let [incomingIds, outgoingIds] = groupServices.getCheckedUsers(req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users' ], req, res),
        incoming = []; // Keep an array of incoming User objects too for including in group

    if(typeof incomingIds[0] !== "undefined")
    {
        for (var i = 0; i < incomingIds.length; i++) {
            let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': incomingIds[i] }, [ 'group' ], req, res);
            incoming.push(checkedUserEntry);
            checkedUserEntry.group = foundGroup;
            dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
            // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
        }
    }

    if(typeof outgoingIds[0] !== "undefined")
    {
        for (var i = 0; i < outgoingIds.length; i++) {
            let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { '_id': outgoingIds[i] }, [ ], req, res);
            await dbopsServices.findByIdAndUpdate(User, outgoingIds[i], { $unset: {"group": null}}, req, res);
            // notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req, res);oundUser);
        }
    }

    var usersOld = foundGroup.users;
    var usersOldIn = usersOld.concat(incoming);
    var usersFinal = usersOldIn.filter( user => !outgoingIds.includes(String(user._id)) );

    foundGroup.users = usersFinal;
    await dbopsServices.savePopulatedEntry(foundGroup, req, res);

    res.redirect('back');

});

// See group messages
router.get('/:groupId/messages', authServices.confirmUserCredentials, async function(req, res) {
    let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users', 'messages' ], req, res),
        foundViewer = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [], req, res);

    res.render('groupMessages', { group: foundGroup, loggedIn: true, user: req.user });
});

// post  group message
router.post('/:groupId/messages', authServices.confirmUserCredentials, async function(req, res) {
    let sender = req.user,
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { '_id': req.params.groupId }, [ 'users' ], req, res),
        newMessageData = new Commentary({ author: sender._id, content: req.body.textareacontent }),
        newMessage = await dbopsServices.savePopulatedEntry(newMessageData, req, res);

    foundGroup.messages = foundGroup.messages.concat([ newMessage ])
    await dbopsServices.savePopulatedEntry(foundGroup, req, res);

    // foundGroup.users.forEach(function(receiver) {
    //     notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver.username, req, res);
    // });

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
        dbopsServices.findByIdAndUpdate(User, foundGroup.users[i]._id, { $unset: {"group": null}}, req, res)
        // Notif not created properly, throws a flash card (red)
        // await notifServices.assignNotification(req.user.username, foundGroup.name, 'group-delete', foundGroup.users[i].username, req, res);
    }
    await dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res);
    res.redirect('back');
});

module.exports = router;
