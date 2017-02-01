# License Extractor
Extract **licenses** from project's external libraries **(*no extra dependencies*)**.  


> Useful for *Due Diligence* purposes.


### How to use
1. As a module:
	1. Install 
	```bash
	$ npm i simple-license-extractor
	```
	2. Use
	```javascript
	const licenseExtractor = require('simple-license-extractor');
	licenseExtractor('/development/my-awesome-project')
		.then(console.log)
		.catch(console.error);
	```
2. As a CLI tool:
	1. Install
	```bash
	$ npm i -g simple-license-extractor
	```
	2. Use
	```bash
	# To run in the directory you are currently in
	$ simple-license-extractor

	# To run in a different directory
	$ simple-license-extractor ~/Development/my-awesome-project
	```


### Types currently supported
- npm
- bower


### Features coming soon
- csv extraction
- maven type support

### Changelog
[here](CHANGELOG.md)