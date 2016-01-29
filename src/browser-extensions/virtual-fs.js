/* jslint node: true */
'use strict';

// var b64 = require('./base64.js').base64DecToArr;
function VirtualFileSystem() {
	this.fileSystem = {};
	this.baseSystem = {};
}

VirtualFileSystem.prototype.readFileSync = function(filename) {
	return this.baseSystem[filename] || this.fileSystem[filename];
};

VirtualFileSystem.prototype.writeFileSync = function(filename, content) {
	this.fileSystem[fixFilename(filename)] = content;
};

VirtualFileSystem.prototype.bindFS = function(data) {
	this.baseSystem = data;
};

module.exports = new VirtualFileSystem();
