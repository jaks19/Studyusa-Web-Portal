require("babel-polyfill")

'use strict';

var dbopsServices = {};

// A mongoose CRUD operation occurs immediately then provides a callback when done
// Instead, can also wrap the run in a promise that is returned once the run is completed
// These methods return promises and at higher level can await them for sunchronous processing
// Or can just invoke the methods without await to let it run async in background, depending on what we need

// This lib makes it easy to just change or mongoose versions in the back

dbopsServices.findOneEntryAndPopulate =
function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, req, res, exclude={}) {
    let fieldsString = fieldsArray.join(' ');
    return new Promise(function (resolve, reject) {
      model.findOne(entryRequirement, exclude).populate(fieldsString).exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}

dbopsServices.findOneEntryAndDeepPopulate =
// Need deepPopulate plugin added to the object's Schema
function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, req, res, exclude={}) {
    return new Promise(function (resolve, reject) {
      model.findOne(entryRequirement, exclude).deepPopulate(fieldsArray).exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}

dbopsServices.findAllEntriesAndPopulate =
function findAllEntriesAndPopulate(model, entryRequirement, fieldsArray, req, res, exclude={}) {
    let fieldsString = fieldsArray.join(' ');
    return new Promise(function (resolve, reject) {
      model
        .find(entryRequirement, exclude)
        .populate(fieldsString).exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}

dbopsServices.findAllEntriesAndDeepPopulate =
function findAllEntriesAndPopulate(model, entryRequirement, fieldsArray, req, res, exclude={}) {
     // Need deepPopulate plugin added to the object's Schema
    return new Promise(function (resolve, reject) {
      model
        .find(entryRequirement, exclude)
        .deepPopulate(fieldsArray).exec(function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}


dbopsServices.findByIdAndUpdate =
function findByIdAndUpdate(model, _id, changes, req, res){
    return new Promise(function (resolve, reject) {
      // { new: true } allows the NEW entry to be returned, not the old one
      model.findByIdAndUpdate( _id, changes, {new: true}, function(error, newEntry){
          if (error) { reject(error) }
          else { resolve(newEntry) }
      });
    });
}


dbopsServices.savePopulatedEntry =
function savePopulatedEntry(populatedEntry, req, res) {
    return new Promise(function (resolve, reject) {
      populatedEntry.save( function(error, data){
          if (error) { reject(error) }
          else { resolve(data) }
      });
    });
}


dbopsServices.findEntryByIdAndRemove =
function findEntryByIdAndRemove(model, id, req, res) {
    return new Promise(function (resolve, reject) {
      model.findByIdAndRemove(id, function(error){
          if (error){ reject(error) }
          else { resolve() }
      });
    });
}

module.exports = dbopsServices;
