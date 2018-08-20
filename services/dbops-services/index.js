require("babel-polyfill")

'use strict';

var dbopsServices = {};

dbopsServices.findOneEntryAndPopulate = async function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, req, res) {
  let entry = model.findOne(entryRequirement);
  if (fieldsArray.length > 0) {
    let fieldsString = fieldsArray.join(' ');
    try {
          entry = await entry.populate(fieldsString).exec();
      } catch (err) {
          req.flash('error', err);
          res.redirect('back');
          return;
      }
  }
  return entry;
}

dbopsServices.findAllEntriesAndPopulate = async function findAllEntriesAndPopulate(model, entryRequirement, fieldsArray, req, res) {
  let entries = model.find(entryRequirement);
  if (fieldsArray.length > 0) {
    let fieldsString = fieldsArray.join(' ');
    try {
          entries = await entries.populate(fieldsString).exec();
      } catch (err) {
          req.flash('error', err);
          res.redirect('back');
          return;
      }
  }
  return entries;
}

function promiseToCreateEntry(model, modelObjectWithData){
  return new Promise(function (resolve, reject) {
    model.create(modelObjectWithData, function(error, newEntry){
        if (error) { reject(error) }
        else { resolve(newEntry) }
    });
  });
}

dbopsServices.createEntryAndSave = async function createEntryAndSave(model, modelObjectWithData, req, res, save = true) {
    var newEntry;
    try { newEntry = await promiseToCreateEntry(model, modelObjectWithData) }
    catch(error) {
      req.flash('error', 'error creating entry');
      res.redirect('back');
      return;
    }
    if (save) {
      newEntry.save(function(error, data){
        if (error){ req.flash('error', error) }
      });
    }
    return newEntry;
}

function promiseToUpdateEntryAndSave(model, entryRequirement, changes){
  return new Promise(function (resolve, reject) {
    model.update( entryRequirement, changes, function(error, newEntry){
        if (error) { reject(error) }
        else { resolve(newEntry) }
    });
  });
}

dbopsServices.updateEntryAndSave = async function updateEntryAndSave(model, entryRequirement, changes, req, res){
    try { await promiseToUpdateEntryAndSave(model, entryRequirement, changes) }
    catch(error) {
      req.flash('error', 'error updating the user entries');
      res.redirect('back');
      return;
    }
}

dbopsServices.savePopulatedEntry = async function savePopulatedEntry(populatedEntry, req, res) {



    try {
          await populatedEntry.save();
      } catch (err) {
          req.flash('error', err);
          console.log('the full', err);
          return;
      }
    }

//   populatedEntry.save(function(error, savedEntry){
//     if (error) {
//
//
//       // This allowed us to find that things were not saving since we redirected here THEN again at external level
//       // Which was bad but the double redirects gave an error that had to be slowly retraced to here
//       // Which shows these hidden spots, if properly announce they are malfunctioning, are helpful
//       // We need a form of logging from those hidden parts.
//
//       // THIS:
//       // res.redirect('back');
//     }
//   });
// }

function promiseTofindEntryByIdAndRemove(model, id, req, res){
  return new Promise(function (resolve, reject) {
    model.findByIdAndRemove(id, function(error){
        if (error){ reject(error) }
        else { resolve() }
    });
  });
}

dbopsServices.findEntryByIdAndRemove = async function findEntryByIdAndRemove(model, id, req, res) {
  try {
    await promiseTofindEntryByIdAndRemove(model, id, req, res);
    req.flash('success', 'Deletion Successful');
  }
  catch (error) {
      req.flash('error', 'Could not remove entry from the database')
  }
  return;
}

module.exports = dbopsServices;
