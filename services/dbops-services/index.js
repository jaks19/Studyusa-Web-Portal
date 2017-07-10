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

function promiseToCreateEntry(model, modelObjectWithData){
  return new Promise(function (resolve, reject) {
    model.create(modelObjectWithData, function(error, newEntry){
        if (error) { reject(error) }
        else { resolve(newEntry) }
    });
  });
}

dbopsServices.createEntryAndSave = async function createEntryAndSave(model, modelObjectWithData, req, res) { 
  var newEntry;
  try { newEntry = await promiseToCreateEntry(model, modelObjectWithData) }
  catch(error) { 
    req.flash('error', 'error creating entry');
    res.redirect('back');
    return;
  }
  newEntry.save(function(error, data){
    if (error){ req.flash('error', error) } 
  });
  return newEntry;
}

dbopsServices.savePopulatedEntry = function savePopulatedEntry(populatedEntry, req, res) {    
  populatedEntry.save(function(error, savedEntry){
    if (error) {
            req.flash('error', error);
            res.redirect('back');
    }
  });
}

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
    await promiseTofindEntryByIdAndRemove(model, id, req, res) 
    req.flash('success', 'Deletion Successful');
  }
  catch (error) { req.flash('error', 'Could not remove entry from the database') }
  return;
}

module.exports = dbopsServices;