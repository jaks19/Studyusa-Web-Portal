var mongoHelper = {},
    mongoose    = require("mongoose"),
    mlog        = require("mocha-logger");

mongoose.Promise = global.Promise;

mongoHelper.startDatabase = function startDatabase(databaseNameString){
    return new Promise(function (resolve, reject) {

      mongoose.connect("mongodb://localhost/"+databaseNameString, {
          useMongoClient: true,
      });

      mongoose.connection.on('connected', function(){
          mlog.success('Connected to database');
          resolve();
      });
    });
}

mongoHelper.stopAndDropDatabase = function stopAndDropDatabase(){
    return new Promise(function (resolve, reject) {
        mongoose.connection.db.dropDatabase(function(){
          mongoose.connection.close();
          resolve();
        });
    });
}

module.exports = mongoHelper;
