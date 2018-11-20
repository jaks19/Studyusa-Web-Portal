var expect = require('chai').use(require('chai-datetime')).expect;

var User = require('../../models/user');

var mongoHelper = require('../helpers/mongo-helper');

var dbopsServices = require('../../services/dbops-services');

var authWithoutReqRes = require('../helpers/auth-without-req-res');

describe('Testing Passport and User Schema: Register a new user', function() {

    before(async function() {
        await mongoHelper.startDatabase('test-db-123');
    });

    it('Registering user should not expose their password', async function() {
        let optionsNewUser = { username: 'user123', name: 'user one two three' },
            password = 'password123',
            userSchemaInstance = new User(optionsNewUser);

        try { await authWithoutReqRes.registerUser(userSchemaInstance, password) }
        catch(err) { mlog.log('error', err) }

        let entry;
        try { entry = await dbopsServices.findOneEntryAndPopulate(User, { username: optionsNewUser.username }, [], true) }
        catch(err) { mlog.log('error', err) }

        expect(entry.password).not.to.exist;
        expect(entry.username).to.equal(optionsNewUser.username);
    });

    it('Registering two users of same username should throw an error by passport', async function() {
        let userSameUsername1 = new User({ username: 'user', name: 'user one two three', password: 'password' }),
            password1 = 'password123',
            userSameUsername2 = new User({ username: 'user', name: 'tralalalala' }),
            password2 = 'secret123';

        try { await authWithoutReqRes.registerUser(userSameUsername1, password1) }
        catch(err) { mlog.log('error', 'Unexpected error at first user creation') }

        try { await authWithoutReqRes.registerUser(userSameUsername2, password2) }
        catch(err) { expect(err.name).to.equal('UserExistsError') }
    });

    after(async function(){
        await mongoHelper.stopAndDropDatabase('test-db-123');
    });
});
