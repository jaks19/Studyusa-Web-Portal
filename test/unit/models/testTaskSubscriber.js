var expect = require('chai').use(require('chai-datetime')).expect;

var TaskSubscriber = require('../../../models/taskSubscriber');

var factory = require('../../helpers/unsaved-mongoose-docs');

describe('TaskSubscriber Model', function() {

    let optionsComplete = {
        user: factory.user1,
        unpublishedWorkspace: 'This is a poem',
        comments: [ factory.comment1, factory.comment2 ]
    }

    let taskSubscriberComplete = new TaskSubscriber(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce a TaskSubscriber model instantiation without errors, given all required fields', async function() {
            let error;

            try { task = await taskSubscriberComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if no user is provided', async function() {
            let taskSubscriberNoUser = new TaskSubscriber({unpublishedWorkspace: 'this is optional'}),
                error;

            try { await taskSubscriberNoUser.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        it('Should have empty field for "unpublishedWorkspace" if not provided', function() {
            let taskSubNoWork = new TaskSubscriber({user: factory.user1});

            expect(taskSubNoWork.unpublishedWorkspace).to.be.an('undefined');
        });

        it('Should have empty array for "comments" if not provided', function() {
            let taskSubNoComments = new TaskSubscriber({user: factory.user1});

            expect(taskSubNoComments.comments).to.be.an('array').that.is.empty;
        });
    });
});
