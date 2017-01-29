# License Extractor
Extract **licenses** from project's external libraries **(*no extra dependencies*)**.  


> Useful for *Due Diligence* purposes.


### How to use
1. As a module *(recommended)*:
```javascript
const licenseExtractor = require('license-extractor');
licenseExtractor('/development/my-awesome-project')
	.then(console.log)
	.catch(console.error);
```
2. Calling the wrapper directly *(lazy)*:
```bash
$ node node_modules/license-extractor/index.spec.js '/development/my-awesome-project' 
```


### Types currently supported
- npm
- bower


### Features coming soon
- csv extraction
- maven type support