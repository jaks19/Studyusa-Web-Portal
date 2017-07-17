let express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    invitationServices = require('../services/invitation-services'),
    Invitation = require("../models/invitation"),
    router = express.Router({ mergeParams: true });

const validDays  = 7,
      garbageCollectDays = 7,
      codeLength = 10;

// View Invitations
router.get('/', authServices.isAdmin, async function(req, res) {
    let invitations = await dbopsServices.findAllEntriesAndPopulate(Invitation, { }, [ ], req, res),
        [ active, expired ] = invitationServices.getSortedInvitations(invitations);
        console.log('active', active, 'expired', expired);
    res.redirect('back');
});

// New Invitation
router.post('/new', authServices.isAdmin, async function(req, res) {
    let newCode = invitationServices.generateCode(codeLength),
        nickname = req.query['nickname'],
        dateNow = new Date(Date.now()),
        dateValid = (new Date()).setDate(dateNow.getDate() + validDays),
        newInvitationData = new Invitation({ code: newCode, validUntil: dateValid, nickname: nickname }),
        newInvitation = await dbopsServices.createEntryAndSave(Invitation, newInvitationData, req, res);
    invitationServices.garbageCollectInvitations(req, res, garbageCollectDays);
    console.log('new', newInvitation);
    req.flash('success', `Created code: ${newCode} for ${nickname}`)
    res.redirect('back');
});

module.exports = router;
