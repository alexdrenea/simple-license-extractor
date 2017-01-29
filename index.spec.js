"use strict";
var licenseExtractor = require('./index');
licenseExtractor(process.argv[2] || './')
    .then(console.log)
    .catch(console.error);
