var User = require('../../models/user');

var passport = require('passport');

let authWithoutReqRes = {}

authWithoutReqRes.registerUser = function registerUser(userSchemaInstance, password){
    return new Promise(function(resolve, reject){
        User.register(userSchemaInstance, password, function(error){
            if (error) { reject(error) }
            else { resolve() }
        });
    });
}

module.exports = authWithoutReqRes;
