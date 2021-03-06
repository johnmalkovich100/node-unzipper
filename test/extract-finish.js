'use strict';

var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var unzip = require('../');
var Stream = require('stream');


test("Only emit finish/close when extraction has completed", function (t) {
  var archive = path.join(__dirname, '../testData/compressed-standard/archive.zip');

  temp.mkdir('node-unzip-finish-', function (err, dirPath) {
    if (err) {
      throw err;
    }

    var filesDone = 0;

    function getWriter() {
      var delayStream = new Stream.Transform();

      delayStream._transform = function(d, e, cb) {
        setTimeout(cb, 500);
      };

      delayStream._flush = function(cb) {
        filesDone += 1;
        cb();
        delayStream.emit('close');
      };

      return delayStream;
    }


    var unzipExtractor = unzip.Extract({ getWriter: getWriter, path: '/tmp' });
    unzipExtractor.on('error', function(err) {
      throw err;
    });
    unzipExtractor.on('close', function() {
      t.same(filesDone,2);
      t.end();
    });

    fs.createReadStream(archive).pipe(unzipExtractor);
  });
});