#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

+ cheerio
- https://github.com/MatthewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+ commander.js
- https://github.com/visionmedia/commander.js
- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ JSON
- http://en.wikipedia.org/wiki/JSON
- https://developer.mozilla.org/en-US/docs/JSON
- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLCorrect = function(inurl) {
    var instr = inurl.toString();
    var url = require('url');
    var urlObject = url.parse(inurl);
    if (urlObject['protocol']!='http:') {
        console.log("%s is not a correct url. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var checkURLresponse = function(checksFile, toConsole) {
    var response2url = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
var checkJson = checkHtml(response.rawEncoded, checksFile);
if (toConsole) console.log(JSON.stringify(checkJson, null, 4));
        }
return checkJson;
    };
    return response2url;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(html, checksFile) {
    $ = cheerio.load(html);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlurl, checksFile, toConsole) {
    var url = require('url');
    var urlObject = url.parse(htmlurl);
    if (urlObject['protocol']=='http:') {
var response = checkURLresponse(checksFile, toConsole);
rest.get(htmlurl).on('complete', response);
    } else {
var html = fs.readFileSync(htmlurl);
var checkJson = checkHtml(html, checksFile);
if (toConsole) console.log(JSON.stringify(checkJson, null, 4));
    }
    return checkJson;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists))
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url>', 'URL to html file', clone(assertURLCorrect))
        .parse(process.argv);
    if (program.checks === undefined) {
        console.log("Must specify check file. Use grader.js --help for available options.");
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    } else if (program.file === undefined && program.url === undefined) {
        console.log("Must specify a file or a url to check. Use grader.js --help for available options.");
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    } else if (program.file !== undefined && program.url !== undefined) {
        console.log("Must specify a file or a url to check, but not both. Use grader.js --help for available options.");
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    } else
var htmlurl = (program.file !== undefined) ? program.file : program.url;
    checkHtmlFile(htmlurl, program.checks, true);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
