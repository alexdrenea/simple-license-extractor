const fs 	= require('fs');
const util 	= require('util');

const dive 	= require(__dirname + '/dive');

const supportedFiles = [
	{ name: 'Bower Components',	file: 'bower.json', 	func: bowerAnalyze },
	{ name: 'Node Modules', 	file: 'package.json', 	func: packageAnalyze }
]

var filesToAnalyze = [];

function bowerAnalyze(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, file) => {
			if(err){
				return reject(err);
			}

			var dependencies = [];
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
			} catch (e) {
				return reject(e);
			}

			return resolve(dependencies);
		});
	});
}

function packageAnalyze(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, file) => {
			if(err){
				return reject(err);
			}

			var dependencies = [];
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
				dependencies = dependencies.concat(Object
					.keys(file.devDependencies)
					.map((key) => {
						return {
							name: key,
							version: file.devDependencies[key]
						};
					}));
			} catch (e) {
				return reject(e);
			}

			return resolve(dependencies);
		});
	});
}

dive(process.argv[2] || process.cwd(), {}, (err, file, stat) => {
	if (err) throw err;
	supportedFiles.forEach((sf) => {
		if(file.indexOf(sf.file) === (file.length - sf.file.length)){
			console.log(`Found ${sf.name}\t${file}`);
			var newSf = util._extend(sf);
			newSf.path = file;
			filesToAnalyze.push(newSf);
		}
	});
}, function() {
	console.log('Scan Complete!');
	Promise
		.all(filesToAnalyze.map((fta) => fta.func(fta.path)))
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
		})
});
