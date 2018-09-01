var expect = require('chai').expect;

var Group = require('../../../models/group');

var factory = require('../../helpers/factory');

describe('Group Model', function() {

    let optionsComplete = {
        name: 'group1',
        users: [ factory.user1, factory.user2 ],
        messages: [ factory.message1, factory.message2 ]
    }

    let groupComplete = new Group(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce a Group model instantiation without errors, given all required fields', async function() {
            let error;

            try { group = await groupComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if name of group not provided', async function() {
            let groupNoName = new Group({}),
                error;

            try { await groupNoName.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        it('Should have today\'s date and current time as "dateCreated"', function() {

            let timeTenSecondsAgo = Date.now() - 10000,
                timeTenSecondsInFuture = Date.now() + 10000;

            let date = new Date(groupComplete.dateCreated);

            expect(date < timeTenSecondsInFuture).to.be.true;
            expect(date > timeTenSecondsAgo).to.be.true;
        });

        it('Should have empty array for "users" if not provided', function() {
            let groupNoUsers = new Group({name: 'This is a group'});

            expect(groupNoUsers.users).to.be.an('array').that.is.empty;
        });

        it('Should have empty array for "messages" if not provided', function() {
            let groupNoMessages = new Group({name: 'This is a group too'});

            expect(groupNoMessages.messages).to.be.an('array').that.is.empty;
        });

    });
});
