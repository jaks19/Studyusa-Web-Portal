// Packages
var express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    groupServices = require('../services/group-services'),
    notifServices = require('../services/notif-services');

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
    let checkedUserIds = groupServices.getCheckedUsers(req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users' ], req, res);

    for (var i = 0; i < checkedUserIds.length; i++) {
        let checkedUserEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': checkedUserIds[i] }, [ ], req, res);
        checkedUserEntry.group = foundGroup;
        foundGroup.users.push(checkedUserEntry);
        dbopsServices.savePopulatedEntry(checkedUserEntry, req, res);
        notifServices.assignNotification(req.user.username, foundGroup.name, 'group-add', checkedUserEntry.username, req, res);
    }

    dbopsServices.savePopulatedEntry(foundGroup, req, res);
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
        console.log(foundGroup);
        foundGroup.messages.push(newMessage);
        dbopsServices.savePopulatedEntry(foundGroup, req, res);
        foundGroup.users.forEach(function(receiver) {
            notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver.username, req, res);
        });
        res.redirect('back');
});

// Remove someone from his/her group
// need to make it a PUT request by making the thing happen through a form instead of href
router.get('/:groupId/remove', authServices.confirmUserCredentials, async function(req, res){
    let foundUser = await dbopsServices.findOneEntryAndPopulate(User, { 'username': req.params.username }, [ 'group' ], req, res),
        foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { 'name': foundUser.group.name }, [ ], req, res);

    await dbopsServices.updateEntryAndSave(User, { 'username': req.params.username }, { $unset: {"group": null}});
    notifServices.assignNotification(req.user.username, foundGroup.name, 'group-remove', req.params.username, req, res);
    if (foundGroup.users.length == 1) { await dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id, req, res) }
    else { foundGroup.users.pull(foundUser) }
    dbopsServices.savePopulatedEntry(foundGroup, req, res);
    res.redirect('back');
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
