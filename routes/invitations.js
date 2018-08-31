const express = require("express");
const constants      = require('../config/constants');

const authServices = require('../services/auth-services');
const dbopsServices = require('../services/dbops-services');
const invitationServices = require('../services/invitation-services');

const Invitation = require("../models/invitation");

let router = express.Router({ mergeParams: true });


// New Invitation
router.post('/new', authServices.isAdmin, async function(req, res) {

    try {
        let newCode = invitationServices.generateCode(constants.LENGTH_OF_INVITATION_CODE);
        let nickname = req.body.nickname;

        let dateNow = new Date(Date.now());
        let validUntil = (new Date()).setDate(dateNow.getDate() + constants.DAYS_FOR_INVITATION_CODE_TO_STAY_VALID);

        let newInvitationData = new Invitation({ code: newCode, validUntil: validUntil, nickname: nickname });
        let newInvitation = await dbopsServices.savePopulatedEntry(newInvitationData);

        invitationServices.garbageCollectInvitations(constants.GARBAGE_COLLECT_IF_EXPIRED_FOR_NUM_DAYS);
        res.redirect('/index/admin/?invitation=yes');
    }
    catch (error) {
        req.flash('error', error.message);
        res.redirect('back');
    }

});

module.exports = router;
