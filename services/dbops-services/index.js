require("babel-polyfill")

'use strict';

var dbopsServices = {};

dbopsServices.populateEntry = async function populateEntry(entry, fieldsArray, req, res) {
  let fieldsString = fieldsArray.join(' ');
  try {
        let populatedUser = await entry.populate(fieldsString).exec();
        return populatedUser;
    } catch (err) {
        req.flash('error', 'Cannot populate associated fields for this user');
        res.redirect('back');
        return;
    }
}

module.exports = dbopsServices;
