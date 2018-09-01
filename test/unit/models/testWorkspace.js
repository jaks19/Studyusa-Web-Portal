var expect = require('chai').expect;

var Workspace = require('../../../models/workspace');

var factory = require('../../helpers/factory');

describe('Workspace Model', function() {

    let optionsComplete = {
        published: true,
        number: 10,
        lockedForPublishing: false,
        content: 'This is my work',
        concernedStudentName: 'Student 1',
        taskName: 'Task 100',
        authorName: 'Mr. Foobar',
        authorMemo: 'I have worked on my thesis',
        datePublished: Date.now(),
        dateEdited: Date.now()
    }

    let workspaceComplete = new Workspace(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce a Workspace model instantiation without errors, given all required fields', async function() {
            let error;

            try { task = await workspaceComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if no "number" is provided', async function() {
            let workspaceNoNumber = new Workspace({
                published: true,
                lockedForPublishing: false,
                content: 'This is my work',
                concernedStudentName: 'Student 1',
                taskName: 'Task 100',
                authorName: 'Mr. Foobar',
                authorMemo: 'I have worked on my thesis',
                datePublished: Date.now(),
                dateEdited: Date.now()
            });

            let error;

            try { await workspaceNoNumber.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "concernedStudentName" is provided', async function() {
            let workspaceNoConcernedStudentName = new Workspace({
                number: 100,
                published: true,
                lockedForPublishing: false,
                content: 'This is my work',
                taskName: 'Task 100',
                authorName: 'Mr. Foobar',
                authorMemo: 'I have worked on my thesis',
                datePublished: Date.now(),
                dateEdited: Date.now()
            });

            let error;

            try { await workspaceNoConcernedStudentName.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "taskName" is provided', async function() {
            let workspaceNoTaskName = new Workspace({
                published: true,
                number: 10,
                lockedForPublishing: false,
                content: 'This is my work',
                concernedStudentName: 'Student 1',
                authorName: 'Mr. Foobar',
                authorMemo: 'I have worked on my thesis',
                datePublished: Date.now(),
                dateEdited: Date.now()
            });

            let error;

            try { await workspaceNoTaskName.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "authorName" is provided', async function() {
            let workspaceNoAuthorName = new Workspace({
                published: true,
                number: 10,
                lockedForPublishing: false,
                content: 'This is my work',
                concernedStudentName: 'Student 1',
                taskName: 'Task 100',
                authorMemo: 'I have worked on my thesis',
                datePublished: Date.now(),
                dateEdited: Date.now()
            });

            let error;

            try { await workspaceNoAuthorName.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        let optionsNoOptionals = {
            number: 10,
            concernedStudentName: 'Student 1',
            taskName: 'Task 100',
            authorName: 'Mr. Foobar',
        }

        let workspaceNoOptionals = new Workspace(optionsNoOptionals);

        it('Should have published=false if not provided', async function() {
            expect(workspaceNoOptionals).to.have.property('published');
            expect(workspaceNoOptionals.published).to.be.false;
        });

        it('Should have lockedForPublishing=false if not provided', function() {
            expect(workspaceNoOptionals).to.have.property('lockedForPublishing');
            expect(workspaceNoOptionals.lockedForPublishing).to.be.false;
        });

        it('Should have empty content, authorMemo, datePublished and dateEdited if not provided', function() {

            expect(workspaceNoOptionals).to.have.property('content');
            expect(workspaceNoOptionals).to.have.property('authorMemo');
            expect(workspaceNoOptionals).to.have.property('datePublished');
            expect(workspaceNoOptionals).to.have.property('dateEdited');

            expect(workspaceNoOptionals.content).to.be.undefined;
            expect(workspaceNoOptionals.authorMemo).to.be.undefined;
            expect(workspaceNoOptionals.datePublished).to.be.undefined;
            expect(workspaceNoOptionals.dateEdited).to.be.undefined;
        });
    });
});
