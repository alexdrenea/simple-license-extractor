'use strict';

import * as fs from 'fs';

const supportedFiles = [
	{ name: 'Bower Components',	file: 'bower.json', 	exec: bowerAnalyze },
	{ name: 'Node Modules', 	file: 'package.json', 	exec: packageAnalyze }
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
	if(!path || fs.accessSync(path)){
		throw new Error('Missing path');
	}

	const projectFiles = fs.readdirSync(path);
	projectFiles.forEach((file) => {
		const supportedFile = supportedFiles.find((supportedFile) => supportedFile.file === file);

		if(supportedFile){
			console.log(`Executing ${supportedFile.name} analysis`);
			supportedFile
				.exec(path)
				.then((res) => {
					console.log(`${supportedFile.name}:`);
					console.log(res);
				});
		}
	});
}

module.exports = analyze;