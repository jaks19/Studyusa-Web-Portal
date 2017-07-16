var filesystemServices = {};

let mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require("fs"), // To read-from/write-to files
    multiparty = require("multiparty"); // To get file object upon selection from pc for upload

filesystemServices.createFolder = async function createFolder(path, req, res) {
    try { return await mkdirp(path) } 
    catch (err) { 
      req.flash('error', 'Could not create a personal uploads folder!');
      res.redirect('back');
    } 
}

filesystemServices.getExistingFilePath = function getExistingFilePath(foundAdd, req) {
    let username = req.params.username;
    let filename = foundAdd.file;
    let ext = foundAdd.ext;
    return path.resolve(".")+'/uploads/' + username + '/' + filename + ext;
}

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

filesystemServices.getAddedFileName = async function getAddedFileName(req, res) {
    try { 
        let file = (await getPromiseToParseForm(req))[1]['doc'][0],
            fileName = file['originalFilename'];
        return fileName;
    } 
    catch (error) { req.flash('error', error) }
}

filesystemServices.getNewFileMetadata = async function getNewFileMetadata(req, res) {
    let fileData = {};
    try { 
        let [ fields, files ] = await getPromiseToParseForm(req);
        fileData.message = fields['message'][0];
        fileData.title = fields['title'][0];
        fileData.fileName = files['doc'][0]['originalFilename'];
        return fileData;
    } 
    catch (error) { 
        req.flash('error', 'Could not retrieve file metadata');
        res.redirect('back');
    }
}

module.exports = filesystemServices;