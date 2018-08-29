let express = require("express"),
    authServices = require('../services/auth-services'),
    dbopsServices = require('../services/dbops-services'),
    invitationServices = require('../services/invitation-services'),
    Invitation = require("../models/invitation"),
    router = express.Router({ mergeParams: true });

const validDays  = 7,
      garbageCollectDays = 7,
      codeLength = 10;

// New Invitation
router.post('/new', authServices.isAdmin, async function(req, res) {
    let newCode = invitationServices.generateCode(codeLength),
        nickname = req.body.nickname,
        dateNow = new Date(Date.now()),
        dateValid = (new Date()).setDate(dateNow.getDate() + validDays),
        newInvitationData = new Invitation({ code: newCode, validUntil: dateValid, nickname: nickname }),
        newInvitation = await dbopsServices.savePopulatedEntry(newInvitationData, req, res);
    invitationServices.garbageCollectInvitations(req, res, garbageCollectDays);
    res.redirect('/index/admin/?invitation=yes');
});

module.exports = router;
