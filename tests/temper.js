var should = require("should");
var path = require("path");
var fs = require("fs");

var Temper = require("../temper.js");

describe("Temper", function() {
	describe("Path creation", function() {
		var tmpDir = "/var/tmp/eval";
		const output = "console.log('Hello World!');";

		it("should create a folder", function(done) {
			var temper = new Temper(tmpDir);
			var folder = temper.createFolder("test");
			
			should.exist(folder);
			console.log(folder.name);

			fs.stat(folder.name, function(err, stats) {
				should.not.exist(err);
				should.exist(stats);

				temper.cleanup();

				fs.stat(folder.name, function(err, stats) {
					should.not.exist(stats);
					done();
				});
			});
		});

		it("should create a file", function(done) {
			var temper = new Temper(tmpDir);
			var folder = temper.createFolder("test");
			var file = temper.createFile(folder.name, "js");

			should.exist(file);

			var filename = path.basename(file.name);
			var ext = filename.substring(filename.indexOf("."), filename.length);
			(ext).should.equal(".js");

			fs.stat(file.name, function(err, stats) {
				should.not.exist(err);
				should.exist(stats);

				temper.cleanup();

				fs.stat(file.name, function(err, stats) {
					should.not.exist(stats);
				});

				fs.stat(folder.name, function(err, stats) {
					should.not.exist(stats);
					done();
				});
			});
		});

		it("should create a temporary file with code", function(done) {
			var temper = new Temper(tmpDir);
			var result = temper.createCode(output, "js", "test");

			var file = result.file;
			fs.readFile(file.name, "utf8", function(err, data) {
				should.not.exist(err);
				should.exist(data);

				(data).should.equal(output);
				temper.cleanup();
				done();
			});
		});
	});
});