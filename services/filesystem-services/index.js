var filesystemServices = {};

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

filesystemServices.getExistingFilePath = function getExistingFilePath(foundAdd, req) {
    let username = req.params.username;
    let filename = foundAdd.file;
    let ext = foundAdd.ext;
    return path.resolve(".")+'/uploads/' + username + '/' + filename + ext;
}

filesystemServices.getAddedFileMetadata = function getAddedFileMetadata(file, foundSub, username) {
    let fileMetadata = {};
    fileMetadata.dirname = path.resolve(".") + '/uploads/' + username + '/', 
    fileMetadata.filenameWithExt = file['originalFilename'],
    fileMetadata.ext = fileMetadata.filenameWithExt.substring(fileMetadata.filenameWithExt.indexOf('.')),
    fileMetadata.filenameNoExt = fileMetadata.filenameWithExt.substring(0, file['originalFilename'].indexOf('.')),
    fileMetadata.newPath = fileMetadata.dirname + fileMetadata.filenameWithExt;
    return fileMetadata;
}

filesystemServices.saveAddedFile = async function saveAddedFile(username, foundSub, req, res) {
    try { 
        let files = (await getPromiseToParseForm(req))[1],
            file = files['doc'][0],
            data = fs.readFileSync(file['path']),
            fileMetadata = filesystemServices.getAddedFileMetadata(file, foundSub, username);
        fs.writeFileSync(fileMetadata.newPath, data);
        return fileMetadata;
    } 
    catch (error) { req.flash('error', error) }
}

filesystemServices.getNewFileMetadata = async function getNewFileMetadata(file, fields, username, req, res) {
    var fileMetadata = {};
    fileMetadata.message = fields['message'][0];
    fileMetadata.title = fields['title'][0];
    fileMetadata.dirname = path.resolve(".") + '/uploads/' + username + '/';
    fileMetadata.filenameWithExt = file['originalFilename'];
    fileMetadata.ext = fileMetadata.filenameWithExt.substring(file['originalFilename'].indexOf('.'));
    fileMetadata.filenameNoExt = fileMetadata.filenameWithExt.substring(0, file['originalFilename'].indexOf('.'));
    fileMetadata.newFilePath = fileMetadata.dirname + fileMetadata.filenameWithExt;
    return fileMetadata
}

filesystemServices.saveNewFile = async function saveNewFile(username, req, res) {
    try { 
        let [ fields, files ] = await getPromiseToParseForm(req),
            file = files['doc'][0],
            data = fs.readFileSync(file['path']),
            fileMetadata = await filesystemServices.getNewFileMetadata(file, fields, username, req, res);
        fs.writeFileSync(fileMetadata.newFilePath, data);
        return fileMetadata;
    } 
    catch (error) { 
        req.flash('error', 'Could not create and save your new submission');
        res.redirect('back');
    }
}

module.exports = filesystemServices;