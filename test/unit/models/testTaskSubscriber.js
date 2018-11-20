var expect = require('chai').expect;

var TaskSubscriber = require('../../../models/taskSubscriber');

var factory = require('../../helpers/factory');

describe('TaskSubscriber Model', function() {

    let optionsComplete = {
        user: factory.user1,
        task: factory.task1,
        unpublishedWorkspaceCounselor: factory.workspace1,
        unpublishedWorkspaceStudent: factory.workspace2,
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
            let taskSubscriberNoUser = new TaskSubscriber({task: factory.task1,
                unpublishedWorkspaceCounselor: factory.workspace1, unpublishedWorkspaceStudent: factory.workspace2}),
                error;

            try { await taskSubscriberNoUser.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no task is provided', async function() {
            let taskSubscriberNoTask = new TaskSubscriber({user: factory.user1,
                unpublishedWorkspaceCounselor: factory.workspace1, unpublishedWorkspaceStudent: factory.workspace2}),
                error;

            try { await taskSubscriberNoTask.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "unpublishedWorkspaceCounselor" provided', async function() {
            let taskSubscriberNoTask = new TaskSubscriber({task: factory.task1, user: factory.user1,
                unpublishedWorkspaceStudent: factory.workspace1}),
                error;

            try { await taskSubscriberNoTask.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "unpublishedWorkspaceStudent" provided', async function() {
            let taskSubscriberNoTask = new TaskSubscriber({task: factory.task1, user: factory.user1,
                unpublishedWorkspaceCounselor: factory.workspace2}),
                error;

            try { await taskSubscriberNoTask.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        it('Should have empty array for "comments" if not provided', async function() {
            let taskSubNoComments = new TaskSubscriber({user: factory.user1, task: factory.task1,
                unpublishedWorkspaceCounselor: factory.workspace1, unpublishedWorkspaceStudent: factory.workspace2});

            expect(taskSubNoComments.comments).to.be.an('array').that.is.empty;
        });

        it('Should have an undefined "lastPublishedWorkspaceCounselor"', async function() {

            expect(taskSubscriberComplete).to.have.property('lastPublishedWorkspaceCounselor');
            expect(taskSubscriberComplete.lastPublishedWorkspaceCounselor).to.be.undefined;

        });

        it('Should have an undefined "lastPublishedWorkspaceStudent"', async function() {

            expect(taskSubscriberComplete).to.have.property('lastPublishedWorkspaceStudent');
            expect(taskSubscriberComplete.lastPublishedWorkspaceStudent).to.be.undefined;

        });
    });
});
