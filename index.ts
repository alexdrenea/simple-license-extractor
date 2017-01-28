'use strict';

import * as fs from 'fs';


interface SupportedFile{
    name: string,
    file: string,
    exec: any
}


const supportedFiles: SupportedFile[] = [
    { name: 'Bower Components',	file: 'bower.json', 	exec: bowerAnalyze },
    { name: 'Node Modules', 	file: 'package.json', 	exec: packageAnalyze },
];

function bowerAnalyze(path: string) {
    return new Promise((resolve, reject) => {
        let searchPath = `${path}/bower_components`;
        try{
            let bowerrc = JSON.parse(fs.readFileSync(`${path}/.bowerrc`, 'utf8'));
            if(bowerrc.directory){
                searchPath = `${path}/${bowerrc.directory}`;
            }
        }
        catch (e){}

        fs.readFile(`${path}/bower.json`, 'utf8', (err, file) => {
            if(err){
                return reject(err);
            }

            let dependencies = [];
            try {
                file = JSON.parse(file);

                if(!file.dependencies){
                    return resolve([]);
                }

                dependencies = dependencies.concat(Object
                    .keys(file.dependencies)
                    .map((key) => {
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
                .all(dependencies.map((dep) => {
                    return new Promise((resolve) => {
                        fs.readFile(`${searchPath}/${dep.name}/bower.json`, 'utf8', (err, file) => {
                            let license = 'undefined';
                            try {
                                file = JSON.parse(file);
                                license = file.license || license;
                            } catch (e) {}

                            dep.license = license;
                            resolve(dep);
                        });
                    });
                }))
                .then((res) => {
                    resolve(res);
                });
        });
    });
}

function packageAnalyze(path: string) {
    return new Promise((resolve, reject) => {
        let searchPath = `${path}/node_modules`;

        fs.readFile(`${path}/package.json`, 'utf8', (err, file) => {
            if(err){
                return reject(err);
            }

            let dependencies = [];
            try {
                file = JSON.parse(file);
                dependencies = dependencies.concat(Object
                    .keys(file.dependencies)
                    .map((key) => {
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
                .all(dependencies.map((dep) => {
                    return new Promise((resolve) => {
                        fs.readFile(`${searchPath}/${dep.name}/package.json`, 'utf8', (err, file) => {
                            let license = 'undefined';
                            try {
                                file = JSON.parse(file);
                                license = file.license || license;
                            } catch (e) {}

                            dep.license = license;
                            resolve(dep);
                        });
                    });
                }))
                .then((res) => {
                    resolve(res);
                });
        });
    });
}

/**
 * Main function
 * @param path Project path
 */
function analyze(path: string) {
    return new Promise((resolve, reject) => {
        if(!path || fs.accessSync(path)){
            return reject('Missing path');
        }

        const projectFiles: string[] = fs.readdirSync(path);

        Promise
            .all(projectFiles
                .map((file) => {
                    const supportedFile: SupportedFile = supportedFiles
                        .find((supportedFile: SupportedFile) => supportedFile.file === file);

                    if(supportedFile){
                        return new Promise((resolve, reject) => {
                            supportedFile
                                .exec(path)
                                .then(resolve)
                                .catch(reject);
                        });
                    }
                })
                .filter((promise) => promise)
            )
            .then(resolve)
            .catch(reject);
    });
}

module.exports = analyze;