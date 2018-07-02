disposablefile
==============

A node.js module for disposable temporary files.

Clean up
--------

All files and directories are in a subdirectory to your system's temporary directory. The entire subdirectory will be recursively deleted when the node.js process is terminated.

API
---

```
const disposableFile = require('disposableFile');
```

### disposableFile.file(options)

Returns a `Promise` which resolves a filename that can be used for temporary data. The file will be deleted on `.cleanUp()` or on process termination.

The `options` object can have those properties:

* `prefix` - Set if you want the filename to begin with a certain string.
* `suffix` - Set if you want the filename to end with a certain string.
* `name` - Set if you want the temporary file to have a specific filename. This overrides the values in the `prefix` and `suffix` options.
* `create` - Set to true if you want the file to be created before the returned `Promise` resolves.

Example usage:

```
const disposableFile = require('disposableFile');
disposableFile.file({ suffix: '.jpg', create: true })
    .then(tmpFile => {
        // tmpFile is now the full path to your disposable file.
    });
```

### disposableFile.dir()

Returns a `Promise` which resolves a directory path that can be used for temporary data. The directory will be created before the `Promise` resolves.
The directory and everything in it will be recursively deleted on `.cleanUp()` or on process termination.

Example usage:

```
const disposableFile = require('disposableFile');
disposableFile.dir()
    .then(tmpDir => {
        // tmpDir is now the full path to an existing temporary directory.
    });
```

### disposableFile.cleanUp()

Deleted all your temporary files and directories. This function will be called before the Node.js process quits.
(But, if the Node.js is killed by a `SIGKILL`, it will die before we can do any clean up...)

Note: `.cleanUp()` is a synchronous function. (That is because only synchronous functions are guaranteed to be finished
before exit on process termination.)

### disposableFile.dirSync()

The synchronous version of `.dir()`

### disposableFile.fileSync(options)

THe synchronous version of `.file()`
