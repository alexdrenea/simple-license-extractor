"use strict";
var licenseExtractor = require('./index');
licenseExtractor(process.argv[2] || './')
    .then(function (res) {
    console.log(res);
})
    .catch(console.error);
