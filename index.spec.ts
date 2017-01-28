import * as licenseExtractor from './index';

licenseExtractor(process.argv[2] || './')
    .then((res) => {
        console.log(res);
    })
    .catch(console.error);