var expect = require('chai').expect;

var UploadedDocument = require('../../../models/uploadedDocument');

var factory = require('../../helpers/factory');

describe('UploadedDocument Model', function() {

    let optionsComplete = {
        documentName: 'Submission 1',
        authorName: 'Robert Lee',
        dateSubmitted: Date.now(),
        fileDescription: 'I corrected my tone',
        s3Path: 'rob/task1/'
    }

    let uploadedDocumentComplete = new UploadedDocument(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce an Uploaded Document model instantiation without errors, given all required fields', async function() {
            let error;

            try { task = await uploadedDocumentComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if no "documentName" is provided', async function() {
            let uploadedDocumentNoDocumentName = new UploadedDocument({
                authorName: 'Robert Lee',
                dateSubmitted: Date.now(),
                fileDescription: 'I corrected my tone',
                s3Path: 'rob/task1/'
            });

            let error;

            try { await uploadedDocumentNoDocumentName.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "authorName" is provided', async function() {
            let uploadedDocumentNoAuthorName = new UploadedDocument({
                documentName: 'Submission 1',
                dateSubmitted: Date.now(),
                fileDescription: 'I corrected my tone',
                s3Path: 'rob/task1/'
            });

            let error;

            try { await uploadedDocumentNoAuthorName.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "fileDescription" is provided', async function() {
            let uploadedDocumentNoFileDescription = new UploadedDocument({
                documentName: 'Submission 1',
                authorName: 'Robert Lee',
                dateSubmitted: Date.now(),
                s3Path: 'rob/task1/'
            });

            let error;

            try { await uploadedDocumentNoFileDescription.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        it('Should throw a ValidationError if no "s3Path" is provided', async function() {
            let uploadedDocumentNoS3Path = new UploadedDocument({
                documentName: 'Submission 1',
                authorName: 'Robert Lee',
                dateSubmitted: Date.now(),
                fileDescription: 'I corrected my tone',
            });

            let error;

            try { await uploadedDocumentNoS3Path.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        let timeTenSecondsAgo = Date.now() - 10000,
            timeTenSecondsInFuture = Date.now() + 10000;

        it('Should have today\'s date and current time as "dateSubmitted"', function() {
            let dateSubmitted = new Date(uploadedDocumentComplete.dateSubmitted);
            expect(dateSubmitted < timeTenSecondsInFuture).to.be.true;
            expect(dateSubmitted > timeTenSecondsAgo).to.be.true;
        });
    });
});
