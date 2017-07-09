require("babel-polyfill")

'use strict';

var dbopsServices = {};

dbopsServices.findOneEntryAndPopulate = async function findOneEntryAndPopulate(model, entryRequirement, fieldsArray, req, res) {
  let rawEntry = model.findOne(entryRequirement);
  let fieldsString = fieldsArray.join(' ');
  try {
        let populatedUser = await rawEntry.populate(fieldsString).exec();
        return populatedUser;
    } catch (err) {
        req.flash('error', err);
        res.redirect('back');
        return;
    }
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
  let newEntry = await promiseToCreateEntry(model, modelObjectWithData);
  newEntry.save(function(error, data){
    if (error){ req.flash('error', error) } 
  });
  return newEntry;
}

dbopsServices.savePopulatedEntry = async function savePopulatedEntry(populatedEntry, req, res) {    
  populatedEntry.save(function(error, savedEntry){
    if (error) {
            req.flash('error', error);
            res.redirect('back');
    }
  });
}



        

module.exports = dbopsServices;