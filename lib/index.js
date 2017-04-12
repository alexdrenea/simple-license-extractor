'use strict';
var fs = require('fs');
var supportedFiles = [
    { name: 'Bower Components', file: 'bower.json', exec: bowerAnalyze },
    { name: 'Node Modules', file: 'package.json', exec: packageAnalyze },
];
function bowerAnalyze(path) {
    return new Promise(function (resolve, reject) {
        var searchPath = path + "/bower_components";
        try {
            var bowerrc = JSON.parse(fs.readFileSync(path + "/.bowerrc", 'utf8'));
            if (bowerrc.directory) {
                searchPath = path + "/" + bowerrc.directory;
            }
        }
        catch (e) { }
        fs.readFile(path + "/bower.json", 'utf8', function (err, file) {
            if (err) {
                return reject(err);
            }
            var dependencies = [];
            try {
                file = JSON.parse(file);
                if (!file.dependencies) {
                    return resolve([]);
                }
                dependencies = dependencies.concat(Object
                    .keys(file.dependencies)
                    .map(function (key) {
                    return {
                        name: key,
                        version: file.dependencies[key]
                    };
                }));
            }
            catch (e) {
                return reject(e);
            }
            Promise
                .all(dependencies.map(function (dep) {
                return new Promise(function (resolve) {
                    fs.readFile(searchPath + "/" + dep.name + "/bower.json", 'utf8', function (err, file) {
                        var license = 'undefined';
                        try {
                            file = JSON.parse(file);
                            license = file.license || license;
                        }
                        catch (e) { }
                        dep.license = license;
                        resolve(dep);
                    });
                });
            }))
                .then(function (res) {
                resolve({
                    bower: res
                });
            });
        });
    });
}
function packageAnalyze(path) {
    return new Promise(function (resolve, reject) {
        var searchPath = path + "/node_modules";
        fs.readFile(path + "/package.json", 'utf8', function (err, file) {
            if (err) {
                return reject(err);
            }
            var dependencies = [];
            try {
                file = JSON.parse(file);
                dependencies = dependencies.concat(Object
                    .keys(file.dependencies)
                    .map(function (key) {
                    return {
                        name: key,
                        version: file.dependencies[key]
                    };
                }));
            }
            catch (e) {
                return reject(e);
            }
            Promise
                .all(dependencies.map(function (dep) {
                return new Promise(function (resolve) {
                    fs.readFile(searchPath + "/" + dep.name + "/package.json", 'utf8', function (err, file) {
                        var license = 'undefined';
                        try {
                            file = JSON.parse(file);
                            license = file.license || file.licenses.map(function (lic){return lic.type}).join() || license;
                        }
                        catch (e) { }
                        dep.license = license;
                        resolve(dep);
                    });
                });
            }))
                .then(function (res) {
                resolve({
                    npm: res
                });
            });
        });
    });
}
function analyze(path) {
    return new Promise(function (resolve, reject) {
        if (!path || fs.accessSync(path)) {
            return reject('Missing path');
        }
        var projectFiles = fs.readdirSync(path);
        Promise
            .all(projectFiles
            .map(function (file) {
            var supportedFile = supportedFiles
                .find(function (supportedFile) { return supportedFile.file === file; });
            if (supportedFile) {
                return new Promise(function (resolve, reject) {
                    supportedFile
                        .exec(path)
                        .then(resolve)
                        .catch(reject);
                });
            }
        })
            .filter(function (promise) { return promise; }))
            .then(resolve)
            .catch(reject);
    });
}
module.exports = analyze;
