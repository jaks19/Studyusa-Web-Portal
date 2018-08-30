require("babel-polyfill")

'use strict';

var dbopsServices = {};

// A mongoose CRUD operation occurs immediately then provides a callback when done
// But it DOES NOT return a promise if don't want callback!
// Instead, we wrap the run in a promise that is returned once the run is completed
// These methods return promises and at higher level can await them for synchronous processing
// Or can just invoke the methods without await to let it run async in background, depending on what we need

// This lib makes it easy to just change our mongoose versions in the back

dbopsServices.findOneEntryAndPopulate =
function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, readOnly=false, exclude={}) {
    let fieldsString = fieldsArray.join(' ');
    let query = model.findOne(entryRequirement, exclude).populate(fieldsString);

    if (readOnly) { query = query.lean() }

    return new Promise(function (resolve, reject) {
      query.exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}

// Need deepPopulate plugin added to the object's Schema
dbopsServices.findOneEntryAndDeepPopulate =
function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, readOnly=false, exclude={}) {
    let query = model.findOne(entryRequirement, exclude).deepPopulate(fieldsArray);
    if (readOnly) { query = query.lean() }

    return new Promise(function (resolve, reject) {
      query.exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}

dbopsServices.findAllEntriesAndPopulate =
function findAllEntriesAndPopulate(model, entryRequirement, fieldsArray, readOnly=false, exclude={}) {
    let fieldsString = fieldsArray.join(' ');
    let query = model.find(entryRequirement, exclude).populate(fieldsString);
    if (readOnly) { query = query.lean() }

    return new Promise(function (resolve, reject) {
      query.exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}

dbopsServices.findAllEntriesAndDeepPopulate =
function findAllEntriesAndPopulate(model, entryRequirement, fieldsArray, readOnly=false, exclude={}) {
    // Need deepPopulate plugin added to the object's Schema
    let query = model.find(entryRequirement, exclude).deepPopulate(fieldsArray);
    if (readOnly) { query = query.lean() }

    return new Promise(function (resolve, reject) {
      query.exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}


dbopsServices.findByIdAndUpdate =
function findByIdAndUpdate(model, _id, changes){
    return new Promise(function (resolve, reject) {
      // { new: true } allows the NEW entry to be returned, not the old one
      model.findByIdAndUpdate( _id, changes, {new: true}, function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}


dbopsServices.savePopulatedEntry =
function savePopulatedEntry(populatedEntry) {
    return new Promise(function (resolve, reject) {
      populatedEntry.save(function(error, data){
          if (error) { reject(error) }
          else { resolve(data) }
      });
    });
}


dbopsServices.findEntryByIdAndRemove =
function findEntryByIdAndRemove(model, id) {
    return new Promise(function (resolve, reject) {
      model.findByIdAndRemove(id, function(error){
          if (error){ reject(error) }
          else { resolve() }
      });
    });
}

module.exports = dbopsServices;
