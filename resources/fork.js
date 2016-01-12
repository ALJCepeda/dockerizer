var path = require("path");
var shell = require("child_process");
var fs = require("fs");
var Promise = require("promise");
var _ = require("underscore");
var Generator = require("./generator");

var DockerFork = function(name, descriptor, tmp) {
	this.name = name;
	this.tmp = tmp;
	this.descriptor = descriptor;

	this.Generator = Generator;
	this.guestRoot = "/scripts";
	this.timeout = 10000;

	var process = null;
	this.process = function(value) {
		if( !_.isUndefined(value) ) { process = value; }
		
		return process;
	};
};

DockerFork.prototype.generator = function() {
	var generator = new this.Generator();
	generator.addMount(this.tmp.dir.name, this.guestRoot);
	generator.workDir = this.guestRoot;

	return generator;
}

DockerFork.prototype.command = function(action) {
	var generator = this.generator();

	var command = generator.docker(this.name, this.descriptor.version, this.descriptor.repository);
	command += " " + generator.create(this.tmp.filename, this.descriptor, action);
	return command;
};

DockerFork.prototype.remove = function() {
	var generator = this.generator();
	var command = generator.remove(this.name);

	return this.fork(command);
};

DockerFork.prototype.stop = function() {
	var generator = this.generator();
	var command = generator.stop(this.name);

	return this.fork(command).then(function(result) {
		this.process(null);
		return Promise.resolve(result);
	}.bind(this));
};

DockerFork.prototype.exists = function() {
	var generator = this.generator();
	var command = generator.exists(this.name);

	return this.fork(command).then(function(data) {
		if(data.stdout !== "") {
			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	});
};

DockerFork.prototype.compile = function(filename) {
	var generator = this.generator();
	var command = generator.docker(this.name, this.descriptor.version, this.descriptor.repository);
	command += " " + generator.create(filename, this.descriptor, "compile");

	return this.fork(command, this.process).then(function(result) {
		this.process(null);
		var url = this.descriptor.compiledName(this.tmp.file.name);

		result.compiledurl = url;
		result.compiledname = path.basename(url);

		return Promise.resolve(result);
	}.bind(this));
};

DockerFork.prototype.execute = function(filename) {
	var generator = this.generator();
	var command = generator.docker(this.name, this.descriptor.version, this.descriptor.repository);
	command += " " + generator.create(filename, this.descriptor, "command");

	return this.fork(command, this.process).then(function(result) {
		this.process(null);
		result.filename = filename;
		return Promise.resolve(result);
	}.bind(this));
};

DockerFork.prototype.fork = function(command, process) {
	//Execute docker command
	var promise = new Promise(function(resolve, reject) {
		var child = shell.exec(command, function(error, stdout, stderr) {
			if(error && error.kill === true) {
				reject({ error:error, stderr:stderr, command:command });
			} else {
				resolve({ stdout:stdout, stderr:stderr, command:command });
			}
		}.bind(this));

		if(_.isFunction(process)) {
			process(child);
		}
	}.bind(this));

	return promise;
};

module.exports = DockerFork;