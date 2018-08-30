var expect = require('chai').use(require('chai-datetime')).expect;

var User = require('../../../models/user');

var mongoHelper = require('../../helpers/mongo-helper');

describe('User Model', function() {


    let optionsComplete = { username: 'user', name: 'user one two three', password: 'password' },
        userComplete = new User(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce a User model instantiation without errors, given all required fields', async function() {
            let error;

            try { userEntry = await userComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if none of the required fields are provided', async function() {
            let userNoData = new User({}),
                error;

            try { await userNoData.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        describe('Omitting fields one by one', function() {

            it('Should throw a ValidationError if name not provided', async function() {
                let userNoName = new User({ username: 'user', password: 'password' }),
                    error;

                try { await userNoName.validate() }
                catch (err) { error = err; }

                expect(error.name).to.equal('ValidationError');
            });

            it('Should throw a ValidationError if username not provided', async function() {
                let userNoUsername = new User({ name: 'user one two three', password: 'password' }),
                    error;

                try { await userNoUsername.validate() }
                catch (err) { error = err; }

                expect(error.name).to.equal('ValidationError');
            });
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        let timeTenSecondsAgo = Date.now() - 10000,
            timeTenSecondsInFuture = Date.now() + 10000;

        it('Should be initialized to non-admin by default', function() {
            expect(userComplete.admin).to.be.false
        });

        it('Should have today\'s date and current time as "date joined"', function() {
            let dateJoined = new Date(userComplete.dateJoined);
            expect(dateJoined < timeTenSecondsInFuture).to.be.true;
            expect(dateJoined > timeTenSecondsAgo).to.be.true;
        });

        it('Should have "lastLoggedIn" to be a past but very recent time', function() {
            let lastLoggedIn = new Date(userComplete.lastLoggedIn);
            expect(lastLoggedIn < timeTenSecondsInFuture).to.be.true;
            expect(lastLoggedIn > timeTenSecondsAgo).to.be.true;
        });

        it('Should have empty field for "group"', function() {
            expect(userComplete.group).to.be.an('undefined');
        });

        it('Should have empty array "tasks"', function() {
            expect(userComplete.tasks).to.be.an('array').that.is.empty;
        });

        it('Should have empty array "messages"', function() {
            expect(userComplete.messages).to.be.an('array').that.is.empty;
        });

        it('Should have empty array for "notifs"', function() {
            expect(userComplete.notifs).to.be.an('array').that.is.empty;
        });
    });

    // Already takes long to connect, then is flaky because of race condition with
    // Init of the model (Basically unique:true works AFTER the model is inited)
    // This defeats the purpose of quick unit tests for development feedback

    // describe('Uniqueness of username', function() {
    //     // After long thought I believe this is still a unit test as it is constraining
    //     // the schema ONLY to be properly configuring uniqueness
    //
    //     let optionsSameUsername1 = { username: 'user', name: 'user one two three', password: 'password' },
    //         optionsSameUsername2 = { username: 'user', name: 'tralalalala', password: 'secret' };
    //
    //     let userSameUsername1 = new User(optionsSameUsername1),
    //         userSameUsername2 = new User(optionsSameUsername2);
    //
    //     before(async function() {
    //         await mongoHelper.startDatabase('test-db');
    //     });
    //
    //     it('DB should not accept two users with same username', async function() {
    //         let error1, error2;
    //
    //         try { await userSameUsername1.save(); }
    //         catch(err) { error1 = err }
    //
    //         try { await userSameUsername2.save(); }
    //         catch(err) { error2 = err }
    //
    //         expect(error2.name).to.equal('MongoError');
    //     });
    //
    //     after(async function(){
    //         await mongoHelper.stopAndDropDatabase('test-db');
    //     });
    // });
});
