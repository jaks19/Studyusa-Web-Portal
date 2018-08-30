var expect = require('chai').use(require('chai-datetime')).expect;

var Task = require('../../../models/task');

var factory = require('../../helpers/unsaved-mongoose-docs');

describe('Task Model', function() {

    let optionsComplete = {
        title: 'This is a task',
        prompt: 'This is a prompt',
        dateCreated: Date.now(),
        dateEdited: Date.now(),
        taskSubscribers: [ factory.taskSubscriber1, factory.taskSubscriber2 ],
        archivedTaskSubscribers: [ factory.taskSubscriber3, factory.taskSubscriber4 ]
    }

    let taskComplete = new Task(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce a Task model instantiation without errors, given all required fields', async function() {
            let error;

            try { task = await taskComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if none of the required fields are provided', async function() {
            let taskNoData = new Task({prompt: 'this is optional'}),
                error;

            try { await taskNoData.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if title not provided', async function() {
            let taskNoTitle = new Task({content: 'This is a task'}),
                error;

            try { await taskNoTitle.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        it('Should have today\'s date and current time as "dateCreated"', function() {

            let timeTenSecondsAgo = Date.now() - 10000,
                timeTenSecondsInFuture = Date.now() + 10000;

            let dateCreated = new Date(taskComplete.dateCreated);
            expect(dateCreated < timeTenSecondsInFuture).to.be.true;
            expect(dateCreated > timeTenSecondsAgo).to.be.true;
        });

        it('Should have today\'s date and current time as "dateEdited"', function() {

            let timeTenSecondsAgo = Date.now() - 10000,
                timeTenSecondsInFuture = Date.now() + 10000;

            let dateEdited = new Date(taskComplete.dateEdited);
            expect(dateEdited < timeTenSecondsInFuture).to.be.true;
            expect(dateEdited > timeTenSecondsAgo).to.be.true;
        });

        it('Should have empty array for "taskSubscribers" if not provided', function() {
            let taskNoTaskSubscribers = new Task({title: 'Task Title 1'});

            expect(taskNoTaskSubscribers.taskSubscribers).to.be.an('array').that.is.empty;
        });

        it('Should have empty array for "archivedTaskSubscribers" if not provided', function() {
            let taskNoArchivedTaskSubscribers = new Task({title: 'This is a task'});

            expect(taskNoArchivedTaskSubscribers.archivedTaskSubscribers).to.be.an('array').that.is.empty;
        });
    });
});
