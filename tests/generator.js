var should = require("should");

var descriptors = require("../descriptors.js");
var Generator = require("../generator.js");

describe("Dockerizer", function() {
	describe("Command Generation", function() {
		var hostRoot = "/var/tmp/eval/test";
		var guestRoot = "/scripts";

		it("should create a run command for docker container", function() {
			var generator = new Generator();
			should.exist(generator);

			var dockerCMD = generator.docker("test", "latest", 'nodejs');
			(dockerCMD).should.equal("sudo docker run  --name test  --rm  literphor/nodejs:latest");
		});

		it("should create run command with working directory", function() {
			var generator = new Generator();
			generator.workDir = guestRoot;

			var dockerCMD = generator.docker("test", "latest", 'nodejs');
			(dockerCMD).should.equal("sudo docker run  --name test  --rm  -w /scripts  literphor/nodejs:latest");
		});

		it("should create run command with mounts", function() {
			var generator = new Generator();
			generator.addMount(hostRoot, guestRoot);

			var dockerCMD = generator.docker("test", "latest", "nodejs");
			(dockerCMD).should.equal("sudo docker run  --name test  --rm  -v /scripts:/var/tmp/eval/test literphor/nodejs:latest");
		});

		it("should create a kill command for test container", function() {
			var generator = new Generator(hostRoot, guestRoot);

			var killCMD = generator.kill("test");
			killCMD.should.equal("sudo docker kill test");
		});

		it("should create check exists command for test container", function() {
			var generator = new Generator(hostRoot, guestRoot);

			var existsCMD = generator.exists("test");
			existsCMD.should.equal("sudo docker ps | grep 'test'");
		});

		it("should create a compile command for pascal", function() {
			var generator = new Generator(hostRoot, guestRoot);
			var pascal = descriptors.pascal;

			var compileCMD = generator.create("test.pas", pascal, "compile");
			compileCMD.should.equal("fpc test.pas");
		});
	}); 
});