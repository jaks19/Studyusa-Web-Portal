require("babel-polyfill")

'use strict';

var dbopsServices = {};

// A mongoose CRUD operation occurs immediately then provides a callback when done
// Instead, can also wrap the run in a promise that is returned once the run is completed
// So we can run the wrapper and await the promise, only continuing when promise returned

// This lib makes it easy to just change or mongoose versions in the back

function promiseToPopulate(queryObject, fieldsString){
  return new Promise(function (resolve, reject) {
    queryObject.populate(fieldsString).exec(function(error, newEntry){
        if (error) { reject(error) }
        else { resolve(newEntry) }
    });
  });
}

function promiseToDeepPopulate(queryObject, fieldsString){
  return new Promise(function (resolve, reject) {
    // Need deepPopulate plugin added to the object's Schema
    queryObject.deepPopulate(fieldsString).exec(function(error, newEntry){
        if (error) { reject(error) }
        else { resolve(newEntry) }
    });
  });
}

dbopsServices.findOneEntryAndPopulate =
async function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, req, res, deep=false, exclude={}) {
    let query = model.findOne(entryRequirement, exclude),
        entry;

    try {
        if (deep){ entry = await promiseToDeepPopulate(query, fieldsArray) }
        else {
            let fieldsString = fieldsArray.join(' ');
            entry = await promiseToPopulate(query, fieldsString)
        }
    }
    catch (err) {
          req.flash('error', err);
          res.redirect('back');
          return;
      }

  return entry;
}

dbopsServices.findAllEntriesAndPopulate =
async function findAllEntriesAndPopulate(model, entryRequirement, fieldsArray, req, res, deep=false, exclude={}) {
    let query = model.find(entryRequirement, exclude),
        entries;

    try {
        if (deep){ entries = await promiseToDeepPopulate(query, fieldsArray) }
        else{
            let fieldsString = fieldsArray.join(' ');
            entries = await promiseToPopulate(query, fieldsString);
        }

    }
    catch (err) {
          req.flash('error', err);
          res.redirect('back');
          return;
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

dbopsServices.createEntryAndSave =
async function createEntryAndSave(model, modelObjectWithData, req, res, save = true) {
    let newEntry;

    try { newEntry = await promiseToCreateEntry(model, modelObjectWithData) }
    catch(error) {
      req.flash('error', 'error creating entry');
      res.redirect('back');
      return;
    }

    if (save) {
      newEntry.save(function(error, entry){
        if (error){ req.flash('error', error) }
        newEntry = entry;
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

// DOES NOT RETURN THE DOCUMENT (i.e. THE ENTRY)
// If need the entry, see findByIdAndUpdate below
dbopsServices.updateEntryAndSave =
async function updateEntryAndSave(model, entryRequirement, changes, req, res){
    try { await promiseToUpdateEntryAndSave(model, entryRequirement, changes) }
    catch(error) {
      req.flash('error', 'error updating the user entries');
      res.redirect('back');
      return;
    }
}


function promiseToFindByIdAndUpdate(model, _id, changes){
  return new Promise(function (resolve, reject) {
    // new: true allows the NEW entry to be returned, not the old one
    model.findByIdAndUpdate( _id, changes, {new: true}, function(error, newEntry){
        if (error) { reject(error) }
        else { resolve(newEntry) }
    });
  });
}

// RETURNS THE DOCUMENT (i.e. THE ENTRY) (but only uses _id to search)
dbopsServices.findByIdAndUpdate =
async function findByIdAndUpdate(model, _id, changes, req, res){
    let entry;

    try { entry = await promiseToFindByIdAndUpdate(model, _id, changes) }
    catch(error) {
      req.flash('error', 'error updating');
      res.redirect('back');
      return;
    }

    return entry;
}

function promiseToSaveEntry(newEntry){
  return new Promise(function (resolve, reject) {
    newEntry.save( function(error, data){
        if (error) { reject(error) }
        else { resolve(data) }
    });
  });
}


dbopsServices.savePopulatedEntry =
async function savePopulatedEntry(populatedEntry, req, res) {
    let entry;
    try { entry = await promiseToSaveEntry(populatedEntry); }
    catch (err) {
          req.flash('error', err);
          console.log('the full', err);
      }
    return;
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

dbopsServices.findEntryByIdAndRemove =
async function findEntryByIdAndRemove(model, id, req, res) {
  try {
    await promiseTofindEntryByIdAndRemove(model, id, req, res);
    req.flash('success', 'Deletion Successful');
  } catch (error) {
      req.flash('error', 'Could not remove entry from the database')
  }
  return;
}

module.exports = dbopsServices;
