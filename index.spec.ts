import * as licenseExtractor from './index';

licenseExtractor(process.argv[2] || './')
    .then(console.log)
    .catch(console.error);