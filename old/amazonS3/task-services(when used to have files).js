var taskServices = {};

let _ =  require('lodash'),
    path = require('path'),
    fs = require("fs"), // To read-from/write-to files
    multiparty = require("multiparty"); // To get file object upon selection from pc for upload

function getPromiseToParseForm(req) {
    // form.parse needs a callback so we make this wrapper to give back a promise instead
    return new Promise(function (resolve, reject) {
        let form = new multiparty.Form();
        form.parse(req, function(error, fields, files){
            console.log(fields);
            console.log(files);

            if (error) { reject(error) }
            else { resolve([ fields, files ]) }
        });
    });
}

taskServices.getTaskData = async function getTaskData(req, res) {
    let taskData = {};

    try {
        let [ fields, files ] = await getPromiseToParseForm(req);
        if (fields.title != null) { taskData.title = fields['title'][0] }
        if (fields.prompt != null) { taskData.prompt = fields['prompt'][0] }
        return taskData;
    }
    catch (error) {
        req.flash('error', 'Could not retrieve task metadata');
        res.redirect('back');
    }
}

taskServices.getCheckedUsers = function getCheckedUsers(req, res) {
  if (req.body.incoming == null && req.body.outgoing == null){
      req.flash('error', "Error, you did not choose any user!");
      return res.redirect('back');
  }

  var checkedIncoming;
  if (!Array.isArray(req.body.incoming)) { checkedIncoming = [req.body.incoming] }
  else { checkedIncoming = req.body.incoming }

  var checkedOutgoing;
  if (!Array.isArray(req.body.outgoing)) { checkedOutgoing = [req.body.outgoing] }
  else { checkedOutgoing = req.body.outgoing }

  return [checkedIncoming, checkedOutgoing];
}

module.exports = taskServices;
