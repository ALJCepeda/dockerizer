var assert = require('assert');
var should = require('should');

var Dockerizer = require('../dockerizer.js');

describe('Dockerizer', function() {
	describe('Container Creation', function() {
		const output = "console.log('Hello World!');";
		const delay = "setTimeout(function() { console.log('finished'); }, 10000);";
		const infinite = "console.log('infinite'); while(true) { }";

		var tmpDir = "/var/tmp/eval/test";
		
		it('should create a nodejs container and output', function(done) {
			var docker = new Dockerizer(tmpDir);

			docker.execute(output, "nodejs", "latest").then(function(result) {
				should.exist(result);
				(result.stdout).should.equal('Hello World!\n');
				done();
			}).catch(done);
		}); 

		it("should not timeout", function(done) {
			this.timeout(30000);

			var docker = new Dockerizer(tmpDir);
			docker.stopAfter = 500;

			docker.execute(delay, "nodejs", "latest", function(result) {
				//This is actually being called after the promise resolved
				(result.stdout).should.equal(docker.name + "\n");
				should.not.exist(docker.fork.process());
			}).then(function(result) {
				//Docker stop needs time to complete and script is able to finish
				(result.stdout).should.equal("finished\n");
			}).catch(done).finally(done);			
		});
		
		it("should timeout", function(done) {
			this.timeout(30000);

			var docker= new Dockerizer(tmpDir);
			docker.stopAfter = 500;

			docker.execute(infinite, "nodejs", "latest", function(result) {
				(result.stdout).should.equal(docker.name + "\n");
				should.not.exist(docker.fork.process());
			}).then(function(result) {
				//Should still resolve with output from container, if there was any
				(result.stdout).should.equal("infinite\n");
			}).catch(done).finally(done);
		});
	});
});