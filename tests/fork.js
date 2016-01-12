var assert = require("assert");
var should = require("should");

var DockerFork = require("../fork");
var Temper = require("../temper");
var descriptors = require("../descriptors");

describe("DockerFork", function() {
	describe("Process Creation", function() {
		const output = "console.log('Hello World!');";
		const delay = "setTimeout(function() { console.log('Hello World!'); }, 500);";
		const infinite = "while(true) { }";
		const infout = "while(true) { console.log('Hello World!'); }";

		var tmpDir = "/var/tmp/eval";
		
		it("should create a nodejs container and output", function(done) {
			var nodejs = descriptors.nodejs;
			nodejs.version = "latest";

			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(delay, "js", "test");
			
			var dockerfork = new DockerFork("test", nodejs, tmp);
			
			dockerfork.execute().then(function(result) {
				(result.stdout).should.equal("Hello World!\n");
				should.not.exist(dockerfork.process());

				done();
			}).catch(done).finally(temper.cleanup);

			should.exist(dockerfork.process());
		});

		it("should exist", function(done) {
			var nodejs = descriptors.nodejs;
			nodejs.version = "latest";

			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(delay, "js", "test");

			var dockerfork = new DockerFork("test", nodejs, tmp);

			dockerfork.execute().then(function(result) {
				should.not.exist(dockerfork.process());

				dockerfork.exists().then(function(exists) {
					(exists).should.equal(false);
					done();
				}).catch(done).finally(temper.cleanup);
			}).catch(done);

			//Give docker a chance to create the container before querying it
			setTimeout(function() {
				dockerfork.exists().then(function(exists) {
					(exists).should.equal(true);
				}).catch(done);
			}, 75);
		});
		
		it("should stop", function(done) {
			var nodejs = descriptors.nodejs;
			nodejs.version = "latest";

			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(delay, "js", "test");

			var dockerfork = new DockerFork("test", nodejs, tmp);
			dockerfork.execute().then(function(result) {
				done();
			}).catch(done).finally(temper.cleanup);

			should.exist(dockerfork.process);
			setTimeout(function() {
				dockerfork.stop().then(function(data) {
					should.not.exist(dockerfork.process());

					return dockerfork.exists().then(function(exists) {
						(exists).should.equal(false);	
					});
				}).catch(done);
			}, 50);
		});
	});
});