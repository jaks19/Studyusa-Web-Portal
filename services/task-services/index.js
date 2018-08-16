var taskServices = {};

let mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require("fs"), // To read-from/write-to files
    multiparty = require("multiparty"); // To get file object upon selection from pc for upload

function getPromiseToParseForm(req) {
    // form.parse needs a callback so we make this wrapper to give back a promise instead
    return new Promise(function (resolve, reject) {
        let form = new multiparty.Form();
        form.parse(req, function(error, fields, files){

            if (error) { reject(error) }
            else { resolve([ fields, files ]) }
        });
    });
}

taskServices.getTaskData = async function getTaskData(req, res) {
    let taskData = {};

    try {
        let [ fields, files ] = await getPromiseToParseForm(req);
        taskData.title = fields['title'][0];
        taskData.prompt = fields['prompt'][0];
        return taskData;
    }
    catch (error) {
        req.flash('error', 'Could not retrieve task metadata');
        res.redirect('back');
    }
}

taskServices.getCheckedUsers = function getCheckedUsers(req, res) {
  if (req.body.chk == null){
      req.flash('error', "You did not choose any user to add to that task!");
      return res.redirect('back');
  }
  var checkedUsers;
  if (!Array.isArray(req.body.chk)) { checkedUsers = [req.body.chk] }
  else { checkedUsers = req.body.chk }
  return checkedUsers;
}

module.exports = taskServices;
