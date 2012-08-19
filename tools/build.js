/*
 * JS code compiler
 * by Jan Palounek 2012, binaryage.com
 * Options
 *  -o - output - Output file specification
 *  -s - shrink - Shrink file, replace spaces, tabs and new lines
 *  -c - remove console.log - Removes all console logging
 *  -h, --help - Display help
 */

var files = ['./libs/ace/ace.js', './src/editors.js', './src/instaedit-editor.js'];

var fs = require('fs');
var processed = '';
var args = process.argv.splice(2);

// Default params
var output = './compiled.js';
var removeConsoleLogs = false;
var shrink = false;

function displayHelp() {
	console.log('JS code compiler');
 	console.log('by Jan Palounek 2012, binaryage.com');
 	console.log('Will compile:');
 	console.log(files);
 	console.log('Options:');
 	console.log(' -o - output - Output file specification');
 	console.log(' -s - shrink - Shrink file, replace spaces, tabs and new lines');
 	console.log(' -c - remove console.log calls - Removes all console logging');
 	console.log(' -h, --help - Display help');
}

for (var i in args) {
	switch(args[i]) {
		case '-o':
			output = args[parseInt(i) + 1];
			break;
		case '-s':
			shrink = true;
			break;
		case '-c':
			removeConsoleLogs = true;
			break;
		case '-h':
			displayHelp();
			break;
		case '--help':
			displayHelp();
			break;
	}
}

for(var i in files) {
	var file = fs.readFileSync(files[i]).toString();
	file = file.split('\n');
	for(var j in file) {
		if(file[j].split('//').length == 1) {
			processed += file[j] + '\n';
		}
	}
}

console.log(' -> Merged all files');

if(removeConsoleLogs) {
	var deconsoled = '';
	processed = processed.split('\n');
	for(var i in processed) {
		if(processed[i].split('console.log(').length == 1) {
			deconsoled += processed[i] + '\n';
		}
	}
	processed = deconsoled;
	console.log(' -> All console.logs removed from code');
}

if(shrink) {
	processed = processed.split('\n').join(' ').split('\t').join(' ').split('  ').join('');
	console.log(' -> Shrinked');
}

fs.writeFileSync(output, processed, 'utf8');
console.log(' -> Wrote result to ' + output);