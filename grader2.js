#!/usr/bin/env node

var fs = require('fs');
var program = require('commander'); 
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "thawing-oasis-5583.herokuapp.com";

// halts if the provided filename doesn't exist
function assertFileExists(filename) {
    if (!fs.existsSync(filename)) {
        console.log("%s does not exist. Exiting.", filename);
        process.exit(1);
    }
    return filename;
}

// loads checks from a file
function loadChecks(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile)).sort();
}

// checks html
function checkHtml(html, checks) {
    $ = cheerio.load(html);
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

// loads html from a file and checks it
// for exports only
function checkHtmlFile(filename, checks) {
    return checkHtml(fs.readFileSync(filename), checks);
}

// downloads html from the internet
// callback is called with two arguments: err, html
// where err is null if there is no error
function download(url, callback) {
    var resp = rest.get(url);
    resp.on('complete', function(result) {
        if (result instanceof Error) {
            // callback(result);
            sys.puts('Error y seguimos reintentando retry: ' + result.message);
            this.retry(5000); // try again after 5 sec
            return;
        }
        console.log('DOWNLOADED sin error, devoviendo callback \n' + result);
	callback(null, result);
    });
}

// CALLBACK FUNCTION, called by both DOWNLOAD and FS.READ: load the file with checks and checks html file
// and returns
function check(err, html) {
    if (err) {
        console.log('Error getting html in callback: ' + err);
        process.exit(1); // exits and done
    }
    var checks = loadChecks(program.checks);
    var checkJson = checkHtml(html, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log('FICHERO DE SALIDA: \n' + outJson);
    // fs.write('grader2-outputHW3part3',checkJson); //write needs to write a buffer -> checkJson
}   


if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url  <url>', 'Path to downloaded url', URL_DEFAULT) ///////////////
        .parse(process.argv); 

    console.log('llamado desde CLI');
    if (program.url) {
        // download the provided url and then check the html
        console.log('URL detectada: llamando a download' + program.url);
	download(program.url, check);
    } else if (program.file) {
        // load html from a file and then check it
        console.log('file detectado: llamando readfile' + program.file);
	fs.readFile(program.file, check);
    }
} else {
    console.log('LLAMADA DESDE LIB !!!');
    exports.loadChecks = loadChecks; // for loading checks
    exports.checkHtmlFile = checkHtmlFile; // for checking a file
}
