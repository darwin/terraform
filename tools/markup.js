/*
 * Site content-origin markup tool
 * by Jan Palounek 2012, binaryage.com
 * Options
 *  -d - directory - Input directory
 *  -r - recursive - Walk through directory tree
 *  -c - contentscript - Content script raw url
 *  -h, --help - Display help
 */

var fs = require('fs');
var exec = require('child_process').exec;
var args = process.argv.splice(2);

// Default params
var options = {
	dir: './',
	recursive: true,
	content_script: ''
}

function displayHelp() {
	console.log('Site content-origin markup tool');
 	console.log('by Jan Palounek 2012, binaryage.com');
 	console.log('Options:');
 	console.log(' -d - directory - Input directory');
 	console.log(' -c - contentscript - Content script raw url');
 	// console.log(' -r - recursive - Walk through directory tree');
 	console.log(' -h, --help - Display help');
}

function walkThrough(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkThrough(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

for(var i in args) {
	switch(args[i]) {
		case '-d':
			options.dir = args[parseInt(i) + 1];
			break;
		case '-r':
			options.recursive = true;
			break;
		case '-c':
			options.content_script = args[parseInt(i) + 1];
			break;
		case '-h':
			displayHelp();
			break;
	}
}

if(args.length == 0) {
	displayHelp();
}

if(options.content_script == '') {
	console.log('!! Error - Content script is required !!')
} else {
	options.content_script = '<script type="instaedit/contentscript" src="' + options.content_script + '"></script>';
}

function filterMds(dir, mds) {
	var markupable = [];
	walkThrough(options.dir, function (err, files) {
		if (err) throw err;
		for (var i in files) {
			if(files[i].split('.')[files[i].split('.').length - 1] == 'md') {
				markupable.push(files[i]);
			}
		}
		mds(markupable);
	});
}

function replaceIn(repo, markupable, cb) {
	var replaced = {};
	for(var i in markupable) {
		file = fs.readFileSync(markupable[i]).toString();
		file = file.toString()
		var source = file;
			
		file = file.split('---\n');
		//https://raw.github.com/JPalounek/totalfinder-web/gh-pages/licensing.md
		//https://raw.github.com/JPalounek/totalfinder-web.git/licensing.md
		var content = file[2];
		var marked = '<span data-content-origin="' + repo + markupable[i].replace(options.dir, '') + '">' + file[2] + '</span>';

		replaced[markupable[i]] = source.replace(content, marked);
	}

	cb(replaced);
}

function getBranch(cons) {
	cons = cons.split('\n');
	for (var i in cons) {
		if(cons[i][0] == '*') {
			return cons[0].split(' ')[1];
		}
	}
}

// Filter files from input dir
console.log('Will markup: ');

filterMds(options.dir, function(mds) {
	// Iterate and markup
	exec('git remote -v', function (error, stdout, stderr) {
		exec('git branch -v', function (branchError, branchStdout, branchStderr) {
			var branch = getBranch(branchStdout);

			repo = stdout.split('origin	')[1].split(' (fetch)')[0].split(' ').join('');
			repo = repo.replace('.git', '')
			repo = repo.replace('https://github.com/', 'https://raw.github.com/');
			repo = repo + '/' + branch;
	
			replaceIn(repo, mds, function (replaced) {
				for(var i in replaced) {
					fs.writeFile(/*'_site/' + */i, replaced[i] + options.content_script, function (err) {
  						if (err) throw err;
					});
				}
			});
		});
	});
});

console.log('done');