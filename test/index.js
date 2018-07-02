const disposablefile = require('../index');
const expect = require('chai').expect;
const fs = require('fs');

describe('disposablefile', () => {

    describe('.dir()', () => {

        it('should resolve a string', () => {

            return disposablefile.dir()
                .then(dir => {
                    expect(dir).to.be.a('string');
                });

        });

        it('should resolve a full path', () => {

            return disposablefile.dir()
                .then(dir => {

                    expect(dir).to.match(/^\//);

                });

        });

        it('should create the temporary directory', () => {

            return disposablefile.dir()
                .then(dir => {

                    const exists = fs.existsSync(dir);
                    expect(exists).to.equal(true);

                });

        });

    });

    describe('.dirSync()', () => {

        it('should resolve a string', () => {

            const dir = disposablefile.dirSync()
            expect(dir).to.be.a('string');

        });

        it('should resolve a full path', () => {

            const dir = disposablefile.dirSync();
            expect(dir).to.match(/^\//);

        });

        it('should create the temporary directory', () => {

            const dir = disposablefile.dirSync();
            const exists = fs.existsSync(dir);
            expect(exists).to.equal(true);

        });

    });

    describe('.file()', () => {

        it('should resolve a string', () => {

            return disposablefile.file()
                .then(file => {
                    expect(file).to.be.a('string');
                });

        });

        it('should resolve a full path', () => {

            return disposablefile.file()
                .then(file => {

                    expect(file).to.match(/^\//);

                });

        });

        it('should return the filename given (if given)', () => {
            return disposablefile.file({ name: 'test.jpg' })
                .then(file => {
                    expect(file).to.match(/\/test\.jpg$/);
                });
        });

        it('should return different paths even if names are the same', () => {
            return disposablefile.file({ name: 'test.jpg' })
                .then(file0 => {
                    return disposablefile.file({ name: 'test.jpg' })
                        .then(file1 => {
                            expect(file0).to.not.equal(file1);
                        });
                });
        });

        it('should not create the file, if not told so', () => {
            return disposablefile.file()
                .then(file => {

                    const exists = fs.existsSync(file);
                    expect(exists).to.equal(false);

                });

        });
        it('should create the file, if told so', () => {
            return disposablefile.file({ create: true })
                .then(file => {

                    const exists = fs.existsSync(file);
                    expect(exists).to.equal(true);

                });

        });

        it('should respect the suffix option', () => {
            return disposablefile.file({ suffix: '.txt' })
            .then(file => {

                expect(file).to.match(/\.txt$/);

            });

        });

        it('should respect the prefix option', () => {
            return disposablefile.file({ prefix: 'test-' })
            .then(file => {

                expect(file).to.match(/\/test-[^\/]+$/);

            });

        });

        it('should handle a combination of prefix and suffix', () => {
            return disposablefile.file({ prefix: 'test-', suffix: '.png' })
                .then(file => {

                    expect(file).to.match(/\/test-[^\/]+\.png$/);

                });
        });

    });

    describe('.fileSync()', () => {

        it('should resolve a string', () => {
            const file = disposablefile.fileSync()
            expect(file).to.be.a('string');

        });

        it('should resolve a full path', () => {
            const file = disposablefile.fileSync()
            expect(file).to.match(/^\//);
        });

        it('should return the filename given (if given)', () => {
            const file = disposablefile.fileSync({ name: 'test.jpg' })
            expect(file).to.match(/\/test\.jpg$/);
        });

        it('should return different paths even if names are the same', () => {
            const file0 = disposablefile.fileSync({ name: 'test.jpg' });
            const file1 = disposablefile.fileSync({ name: 'test.jpg' });
            expect(file0).to.not.equal(file1);
        });

        it('should not create the file, if not told so', () => {
            const file = disposablefile.fileSync();
            const exists = fs.existsSync(file);
            expect(exists).to.equal(false);
        });

        it('should create the file, if told so', () => {
            const file = disposablefile.fileSync({ create: true });
            const exists = fs.existsSync(file);
            expect(exists).to.equal(true);
        });

        it('should respect the suffix option', () => {
            const file = disposablefile.fileSync({ suffix: '.txt' });
            expect(file).to.match(/\.txt$/);
        });

        it('should respect the prefix option', () => {
            const file = disposablefile.fileSync({ prefix: 'test-' });
            expect(file).to.match(/\/test-[^\/]+$/);
        });

        it('should handle a combination of prefix and suffix', () => {
            const file = disposablefile.fileSync({ prefix: 'test-', suffix: '.png' })
            expect(file).to.match(/\/test-[^\/]+\.png$/);
        });

    });

    describe('.cleanUp()', () => {

        it('can be called without errors even if there is nothing to clean up', () => {

            disposablefile.cleanUp();
            disposablefile.cleanUp();
            disposablefile.cleanUp();

        });

        it('will clean up stuff', () => {
            return Promise.all([
                disposablefile.file({ create: true }),
                disposablefile.file({ create: true }),
                disposablefile.dir(),
                disposablefile.dir()
            ])
                .then(files => {
                    files.forEach(file => {
                        const exists = fs.existsSync(file);
                        expect(exists).to.equal(true);
                    });

                    disposablefile.cleanUp(); // This is a synchronous function.

                    files.forEach(file => {
                        const exists = fs.existsSync(file);
                        expect(exists).to.equal(false);
                    });
                })
        });
    });

});