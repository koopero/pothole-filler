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
		help: 'Output file'
	}
);

parser.addArgument(
	[ 'input'],
	{
		help: 'Input PNG file',
		narg: 1
	}
);

var args = parser.parseArgs();


var infile = args.input;
var outfile = args.o || infile;

var processFile = require('./index.js').processFile;
processFile( infile, outfile );