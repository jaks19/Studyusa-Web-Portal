const express = require("express");
const format = require('../text/notifJson');

const authServices = require('../services/auth-services');
const dbopsServices = require('../services/dbops-services');
const groupServices = require('../services/group-services');
const notifServices = require('../services/notif-services');
const userServices = require('../services/user-services');
const formServices = require('../services/form-services');

const Group = require("../models/group");
const User = require("../models/user");
const Commentary = require("../models/commentary");


let router = express.Router({ mergeParams: true });

// Index
router.get('/', authServices.isAdmin, async function(req, res) {

    try {
        let groups = await dbopsServices.findAllEntriesAndPopulate(Group, { }, [ 'users' ], true);
        let freeUsers = await dbopsServices.findAllEntriesAndPopulate(User, { 'group': null }, [ ], true);
        let users = await dbopsServices.findAllEntriesAndPopulate(User, { }, [ ], true);

        res.render('./admin/groups', {
            user: req.user,
            freeUsers: freeUsers,
            users: users,
            groups: groups,
            loggedIn: true
        });
    }
    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }
});


// New Group
router.post('/', authServices.isAdmin, async function(req, res) {

    try {
        let checkedValuesByName = formServices.getCheckedValuesByName(['incoming'], req);
        let incomingIds = checkedValuesByName['incoming'];

        if (incomingIds.length == 0) {
            req.flash('error', 'No user was selected to be part of the new group, so it was not created!');
            res.redirect('back');
            return;
        }

        let newGroupData = new Group({ name: req.body.name });
        let groupEntry = await dbopsServices.savePopulatedEntry(newGroupData);

        let incomingUsers = await groupServices.updateMembershipIncomingUsers(incomingIds, groupEntry);
        groupEntry.users = groupEntry.users.concat(incomingUsers);
        await dbopsServices.savePopulatedEntry(groupEntry);

        req.flash('success', 'Group successfully created!');
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect('back');
});


// Add/remove to Group
router.put('/:groupId/add', authServices.isAdmin, async function(req, res) {

    try{
        let checkedValuesByName = formServices.getCheckedValuesByName(['incoming', 'outgoing'], req);
        let incomingIds = checkedValuesByName['incoming'];
        let outgoingIds = checkedValuesByName['outgoing'];

        if (incomingIds.length == 0 && outgoingIds.length == 0) {
            req.flash('error', 'No user was selected!');
            res.redirect('back');
            return;
        }

        let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { _id: req.params.groupId }, [ 'users' ],  false);

        let incomingUsers = await groupServices.updateMembershipIncomingUsers(incomingIds, foundGroup);
        await groupServices.updateMembershipOutgoingUsers(outgoingIds);
        await groupServices.updateGroupMembership(foundGroup, incomingUsers, outgoingIds);
    }

    catch(error) { req.flash('error', error.message) }    

    res.redirect('back');

});

// See group messages
router.get('/:groupId/messages', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group,
            { _id: req.params.groupId }, [ 'users', 'messages' ], true);
        let foundViewer = await dbopsServices.findOneEntryAndPopulate(User,
            { 'username': req.params.username }, [], true);

        res.render('groupMessages', {
            group: foundGroup,
            loggedIn: true,
            user: req.user
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }

});

// Post group message
router.post('/:groupId/messages', authServices.confirmUserCredentials, async function(req, res) {

    try {
        let sender = req.user;
        let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group, { '_id': req.params.groupId }, [ 'users' ], false);
        let newMessageData = new Commentary({ author: sender._id, content: req.body.textareacontent });
        let newMessage = await dbopsServices.savePopulatedEntry(newMessageData);

        foundGroup.messages = foundGroup.messages.concat([ newMessage ])
        await dbopsServices.savePopulatedEntry(foundGroup);

        // for (const receiver of foundGroup.users) {
        //     notifServices.assignNotification(sender.username, newMessage.content.substr(0, 30) + '...', 'msg-group', receiver.username, req, res);
        // });
    }
    catch (error) { req.flash('error', error.message) }


    res.redirect('back');
});


// See a specific Group's members
// Loads the admin dashboard with this group pre-loaded as a search term
router.get('/:groupId', authServices.isAdmin, async function(req, res) {
    res.redirect('/index/' + req.params.username + '?groupId=' + req.params.groupId);
});

// Delete a Group
router.delete('/:groupId', authServices.isAdmin, async function(req, res) {
    try {
        let foundGroup = await dbopsServices.findOneEntryAndPopulate(Group,
            { '_id': req.params.groupId }, [ 'users' ], true);

        await groupServices.recycleGroupMembers(foundGroup.users);
        await dbopsServices.findEntryByIdAndRemove(Group, foundGroup._id);
    }

    catch (error) { req.flash('error', error.message) }
    res.redirect('back');
});

module.exports = router;
