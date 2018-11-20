let groupServices = {};

const dbopsServices = require('../services/dbops-services');

const User = require('../models/user');


groupServices.updateMembershipIncomingUsers =
    async function updateMembershipIncomingUsers(incomingIds, groupEntry) {

        let incomingUserDocs = []

        for (const id_in of incomingIds) {
            let userEntry = await dbopsServices.findOneEntryAndPopulate(User, { '_id': id_in }, [ ], false);
            userEntry.group = groupEntry;
            let savedUserEntry = await dbopsServices.savePopulatedEntry(userEntry);
            incomingUserDocs.push(savedUserEntry)
            // notifServices.assignNotification(req.user.username, groupName, 'group-add', checkedUserEntry.username);
        }

        return incomingUserDocs;
}


groupServices.updateMembershipOutgoingUsers =
    async function updateMembershipOutgoingUsers(outgoingIds) {

        for (const id_out of outgoingIds) {
            let userToUngroup = await dbopsServices.findOneEntryAndPopulate(User, { '_id': id_out }, [ ], false);

            await dbopsServices.findByIdAndUpdate(User, id_out,
                { $unset: {"group": null}})

            // notifServices.assignNotification(req.user.username, groupName, 'group-add', checkedUserEntry.username);
        }

        return;
}


groupServices.updateGroupMembership =
    async function updateGroupMembership(foundGroup, incomingUsers, outgoingIds) {

        let groupMembersMinusOut = foundGroup.users.filter( (user) => {
            return !outgoingIds.includes(String(user._id));
        });

        let groupMembersMinusOutPlusIn = groupMembersMinusOut.concat(incomingUsers);

        foundGroup.users = groupMembersMinusOutPlusIn;
        await dbopsServices.savePopulatedEntry(foundGroup);

        return;
}


groupServices.recycleGroupMembers =
    async function recycleGroupMembers(users) {

        for (const user of users) {
            await dbopsServices.findByIdAndUpdate(User, user._id,
                { $unset: {"group": null}});
            // await notifServices.assignNotification(req.user.username, foundGroup.name, 'group-delete', foundGroup.users[i].username);
        }

        return;
}

module.exports = groupServices;
