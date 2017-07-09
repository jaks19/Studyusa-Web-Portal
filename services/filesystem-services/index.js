var filesystemServices = {};

let mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require("fs"), // To read-from/write-to files
    multiparty = require("multiparty"); // To get file object upon selection from pc for upload

filesystemServices.createUserFolder = async function createUserFolder(username, req, res) {
    try {  
         return await mkdirp(path.resolve(".") + '/uploads/' + username);
     } catch (err) { 
         req.flash('error', 'Could not create a personal uploads folder!');
         res.redirect('back');
     } 
}

filesystemServices.getExistingFilePath = function getExistingFilePath(foundAdd, req) {
    let username = req.params.username;
    let folderSlashFile = foundAdd.submission.folder + '/' + foundAdd.file;
    let ext = foundAdd['ext'];
    return path.resolve(".")+'/uploads/' + username + '/' + folderSlashFile + ext;
}

filesystemServices.getFileMetadata = function getFileMetadata(file, foundSub, username) {
    let fileMetadata = {};
    fileMetadata.dirname = path.resolve(".") + '/uploads/' + username + '/', 
    fileMetadata.foldername = foundSub['folder'],
    fileMetadata.filenameWithExt = file['originalFilename'],
    fileMetadata.ext = fileMetadata.filenameWithExt.substring(fileMetadata.filenameWithExt.indexOf('.')),
    fileMetadata.filenameNoExt = fileMetadata.filenameWithExt.substring(0, file['originalFilename'].indexOf('.')),
    fileMetadata.newPath = fileMetadata.dirname + fileMetadata.foldername + '/' + fileMetadata.filenameWithExt;
    return fileMetadata;
}

function getPromiseToParseForm(req) {
    // form.parse needs a callback so we make this wrapper to give back a promise instead
    return new Promise(function (resolve, reject) {
        let form = new multiparty.Form();
        form.parse(req, function(error, fields, files){
            if (error) { reject(error) }
            else { resolve(files) }
        });
    });
}
        
filesystemServices.saveUploadedFile = async function saveUploadedFile(username, foundSub, req, res) {
    try { 
        let files = await getPromiseToParseForm(req),
            file = files['doc'][0],
            data = fs.readFileSync(file['path']),
            fileMetadata = filesystemServices.getFileMetadata(file, foundSub, username);
        fs.writeFileSync(fileMetadata.newPath, data);
        return fileMetadata;
    } 
    catch (error) { req.flash('error', error) }
}

module.exports = filesystemServices;