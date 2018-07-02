const crypto = require('crypto');
const fs = require('fs');
const onDeath = require('ondeath');
const os = require('os');
const path = require('path');

const osTmpDir = fs.realpathSync(os.tmpdir());

let basePath = path.join(osTmpDir, 'disposables-' + process.pid + '-' + crypto.randomBytes(Math.ceil(16)).toString('hex'));;
let baseDirPromise;

function baseDir() {
    if (baseDirPromise) return baseDirPromise;
    return baseDirPromise = new Promise((resolve, reject) => {
        fs.mkdir(basePath, err => {
            if (err) {
                if (err.code === 'EEXIST') return resolve(basePath); // Dir already exists.
                return reject(err);
            }
            resolve(basePath);
        });
    });
}

function baseDirSync() {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    return basePath;
}

function cleanUp() {
    if (!fs.existsSync(basePath)) return;

    lsr(basePath).sort((a, b) => b.length - a.length)
        .forEach(file =>
            fs.statSync(path.join(file)).isDirectory() ?
                fs.rmdirSync(file) :
                fs.unlinkSync(file)
        );

    fs.rmdirSync(basePath);
    baseDirPromise = null;
}

function dir() {
    return baseDir()
        .then(dir => {
            return path.join(dir, crypto.randomBytes(Math.ceil(16)).toString('hex'));
        })
        .then(dir => {
            return new Promise((resolve, reject) => {
                fs.mkdir(dir, err => {
                    if (err) return reject(err);
                    resolve(dir);
                });    
            });
        });
}

function dirSync() {
    const dir = path.join(baseDirSync(), crypto.randomBytes(Math.ceil(16)).toString('hex'));
    fs.mkdirSync(dir);
    return dir;
}

const defaultOptions = {
    create: false,
    name: null,
    prefix: '',
    suffix: ''
};

function file(options) {
    options = {...defaultOptions, ...options};
    return dir()
        .then(dir => {
            if (typeof options.name !== 'string') {
                return path.join(dir, options.prefix + crypto.randomBytes(Math.ceil(16)).toString('hex') + options.suffix);
            }
            return path.join(dir, options.name);
        })
        .then(file => {
            if (options.create === false) return file;

            return new Promise((resolve, reject) => {
                fs.open(file, 'w', (err, fd) => {
                    if (err) return reject(err);
                    resolve(fd);
                });
            })
                .then(fd => {
                    fs.close(fd, (err) => {
                        // Nevermind...
                    });
                    return file;
                });
        });
}

function fileSync(options) {
    options = {...defaultOptions, ...options};
    const dir = dirSync();
    let file;
    if (typeof options.name !== 'string') {
        file = path.join(dir, options.prefix + crypto.randomBytes(Math.ceil(16)).toString('hex') + options.suffix);
    } else {
        file = path.join(dir, options.name);
    }
    if (options.create === false) return file;
    const fd = fs.openSync(file, 'w');
    fs.closeSync(fd);
    return file;
}

function lsr(dir) { // synchronous recursive ls
    return fs.readdirSync(dir)
        .reduce(
            (files, file) => {
                files.push(path.join(dir, file));
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    return files.concat(lsr(path.join(dir, file)))
                } else {
                    return files;
                }
            },
            []
        );
}

onDeath(cleanUp);

module.exports = {
    cleanUp,
    dir,
    dirSync,
    file,
    fileSync
}