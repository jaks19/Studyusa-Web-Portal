var expect = require('chai').use(require('chai-datetime')).expect;

var Commentary = require('../../../models/commentary');

var factory = require('../../helpers/unsaved-mongoose-docs');

describe('Commentary Model', function() {

    let optionsComplete = {
        author: factory.user1,
        recipient: factory.user2,
        content: 'This is a comment'
    }

    let commentComplete = new Commentary(optionsComplete);

    describe('Data Validation', function() {

        it('Should produce a Commentary model instantiation without errors, given all required fields', async function() {
            let error;

            try { comment = await commentComplete.validate() }
            catch (err) { error = err; }

            expect(error).not.to.exist;
        });

        it('Should throw a ValidationError if none of the required fields are provided', async function() {
            let userNoData = new Commentary({}),
                error;

            try { await userNoData.validate() }
            catch (err) { error = err; }

            expect(error.name).to.equal('ValidationError');
        });

        describe('Omitting fields one by one', function() {

            it('Should throw a ValidationError if author not provided', async function() {
                let commentNoAuthor = new Commentary({content: 'This is a comment'}),
                    error;

                try { await commentNoAuthor.validate() }
                catch (err) { error = err; }

                expect(error.name).to.equal('ValidationError');
            });

            it('Should throw a ValidationError if content not provided', async function() {
                let commentNoContent = new Commentary({author: factory.user1}),
                    error;

                try { await commentNoContent.validate() }
                catch (err) { error = err; }

                expect(error.name).to.equal('ValidationError');
            });
        });
    });

    describe('Default Values, when given all the required (non-defaulted) fields', function() {

        it('Should have today\'s date and current time as "date"', function() {

            let timeTenSecondsAgo = Date.now() - 10000,
                timeTenSecondsInFuture = Date.now() + 10000;

            let date = new Date(commentComplete.date);
            expect(date < timeTenSecondsInFuture).to.be.true;
            expect(date > timeTenSecondsAgo).to.be.true;
        });


        it('Should have empty field for "recipient" if not provided', function() {
            let commentNoRecipient = new Commentary({author: factory.user1, content: 'This is a comment'});

            expect(commentNoRecipient.recipient).to.be.an('undefined');
        });

    });
});
