require('./object.js');
var _ = require('underscore');
var Descriptor = function(data) {
	var self = this;
	this.repository = '';
	this.ext = '';
	this.versions = [];
	this.command = '';
	this.compile = '';
	this.mounts = [];
	this.removals = [];
	this.precode = '';

	Object.assign(this, data);
	this.hasVersion = function(version) {
		return self.versions.indexOf(version) !== -1;
	};

	this.compiledName = function(file) {
		var index = file.indexOf('.');
		if(index === -1) {
			return file;
		}

		return file.substring(0, index);
	};

	this.needsCompile = function() {
		return self.compile !== '';
	}
};

var php = new Descriptor({
	repository:'php',
	ext: 'php',
	versions: [ '5.4', '5.5', '5.6' ],
	command: 'php ',
	mounts: [{
		host:'/var/www/node/eval/resources/configs/php.ini',
		guest:'/usr/local/etc/php/php.ini'
	}],
	precode: '<?php\n\techo "Hello World!";'
});

var nodejs = new Descriptor({
	repository:'nodejs',
	ext: 'js',
	versions: [ '0.12.7', 'latest' ],
	command: 'node ',
	precode:'console.log("Hello World!");'
});

var haskell = new Descriptor({
	repository:'haskell',
	ext: 'hs',
	versions: [ '7.10.2', 'latest' ],
	precode: 'main = putStrLn "Hello World!";',
	command: './',
	compile: function(file) {
		return 'ghc -o ' + this.compiledName(file) + ' ' + file;
	}

});

var pascal = new Descriptor({
	repository:'pascal',
	ext:'pas',
	versions: [ '2.6.4', 'latest' ],
	precode: 'program Hello;\nbegin\n\twriteln (\'Hello World!\');\nend.',
	command: './',
	compile:'fpc ',
	removals: [
		'Free((.*)\n(.*)\n(.*))i386\n',
		'\(normal if you did not specify a source file to be compiled\)'
	],
});

module.exports = {
	php:php,
	nodejs:nodejs,
	haskell:haskell,
	pascal:pascal
};