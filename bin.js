#!/bin/sh
':' //; exec "`command -v nodejs || command -v node`" "$0" "$@"

var pkg = JSON.parse(  require('fs').readFileSync( require('path').resolve( __dirname, './package.json'),'utf8') );
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
	version: pkg.version,
	addHelp: true,
	description: pkg.description
});

parser.addArgument(
	[ '-o'],
	{
		help: 'Output file',
		dest: 'output',
	}
);

parser.addArgument(
	[ 'input'],
	{
		help: 'Input PNG file',
		narg: 1
	}
);

parser.addArgument(
	[ '-gray'],
	{
		help: 'Treat input as grayscale and act on RGB channels rather than alpha channel.',
		action: 'storeTrue',
	}
);

parser.addArgument(
	[ '-t'],
	{
		help: 'Threshold for depths to be considered holes.',
		type: 'int',
		dest: 'threshold',
		defaultValue: 10
	}
);

var args = parser.parseArgs();


var infile = args.input;
var outfile = args.output || infile;
var channel = args.gray ? 0 : 3;
var threshold = args.threshold;

var processFile = require('./index.js').processFile;
processFile( infile, outfile, channel, threshold );