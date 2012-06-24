var Worker = function () {};

Worker.siteContent = '';
Worker.editorContent = '';
Worker.parserCode = '';

Worker.prototype.trim = function trim(string) {
	return string.replace(/^\s+||\s+$/g, '');
}

Worker.prototype.importSiteContentFromScriptTag = function (scriptType) {
	var content = 'not found';

	var metas = document.getElementsByTagName('script');
	for(var i in metas) {
		var meta = metas[i];
		if(meta.type == scriptType) {
			content = meta.innerHTML;
		}
	}

	return content;
}

Worker.prototype.httpRequest = function (url, cb) {
	var request = new XMLHttpRequest();  
	request.onloadend = function () { 
		cb(request.responseText);
	}
	request.open('GET', url, true);  
	request.send();
}

Worker.prototype.addScript = function (name, cb) {
	var th = document.getElementsByTagName('head')[0];

	var s = document.createElement('script');
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', name);

	s.onload = function () {
		cb();
	}

	th.appendChild(s);
}

Worker.prototype.addJQuery = function (data, cb) {
	if (typeof jQuery != 'undefined') {  
 		console.log('jQuery already loaded.');
 		cb(data);
	} else {
	    this.addScript('https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function () {
	    	cb(data);
	    });
	}
}

Worker.prototype.loadFromGithuAPI = function (url, cb) {
	this.addJQuery(url, function (url) {
		var originUrl = url;
		var url = url.split('/');
		var user = url[3].replace('undefined');
		var repo = url[4].replace('undefined');
		var branch = url[5].replace('undefined');

		if(url.length == 6) {
			var path = url[6].replace('undefined');
		} else {
			var path = '';
			for(var i = 7; i <= url.length; i++) {
				path += '/' + url[i - 1].replace('undefined');
			}
			path = path.substr(1);
		}

		var url = 'https://api.github.com/repos/' + user + '/' + repo + '/git/refs/heads/' + branch;
		jQuery.getJSON(url + "?callback=?", {}, function(data) {
			var url = 'https://api.github.com/repos/' + user + '/' + repo + '/git/trees/' + data.data.object.sha;
			jQuery.getJSON(url + "?callback=?", {recursive: 1}, function(data) {
				for(var j in data.data.tree) {
					if(path == data.data.tree[j].path) {
						var url = data.data.tree[j].url;
						jQuery.getJSON(url + "?callback=?", {recursive: 1}, function(data) {
							var data = Worker.prototype.decode64(data.data.content)
							cb(data);
						});
					}
				}
  			});
		});
	});
}

Worker.prototype.encode64 = function (input) {
	var keyStr = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
   	    "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";

 	input = escape(input);
 	var output = "";
 	var chr1, chr2, chr3 = "";
 	var enc1, enc2, enc3, enc4 = "";
 	var i = 0;

	do {
 	   chr1 = input.charCodeAt(i++);
 	   chr2 = input.charCodeAt(i++);
 	   chr3 = input.charCodeAt(i++);

	   enc1 = chr1 >> 2;
 	   enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
 	   enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
 	   enc4 = chr3 & 63;

	   if (isNaN(chr2)) {
 	      enc3 = enc4 = 64;
 	   } else if (isNaN(chr3)) {
 	      enc4 = 64;
 	   }

	   output = output +
 	      keyStr.charAt(enc1) +
 	      keyStr.charAt(enc2) +
 	      keyStr.charAt(enc3) +
 	      keyStr.charAt(enc4);
 	   chr1 = chr2 = chr3 = "";
 	   enc1 = enc2 = enc3 = enc4 = "";
 	} while (i < input.length);

	return output;
}

Worker.prototype.decode64 = function (input) {
  	var keyStr = "ABCDEFGHIJKLMNOP" +
               "QRSTUVWXYZabcdef" +
               "ghijklmnopqrstuv" +
               "wxyz0123456789+/" +
               "=";

     var output = "";
     var chr1, chr2, chr3 = "";
     var enc1, enc2, enc3, enc4 = "";
     var i = 0;

     // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
     var base64test = /[^A-Za-z0-9\+\/\=]/g;
     input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

     do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
           output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
           output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

     } while (i < input.length);

     return unescape(output);
  }

Worker.prototype.getMetaContent = function (name) {
	var content = 'not found';

	var metas = document.getElementsByTagName('meta');
	for(var i in metas) {
		var meta = metas[i];
		if(meta.name == name) {
			content = meta.content;
		}		
	}

	return content;
}

Worker.prototype.getParserCode = function (scriptUrl, cb) {
	if(typeof scriptUrl != 'undefined') {
		var request = new XMLHttpRequest();  
		request.onloadend = function () { 
			console.log(request.responseText);
			cb(request.responseText);
		}
		request.open('GET', scriptUrl, true);  
		request.send();  
	}
}

Worker.prototype.importSiteContentFromMetaTag = function (scriptType, scriptUrl, cb) {
	if(typeof scriptUrl != 'undefined') {
		if(scriptUrl.replace('github.com') == scriptUrl) {
			var request = new XMLHttpRequest();  
			request.onloadend = function () { 
				if(request.statusCode == 200) {
					cb(request.responseText);
				} else {
					cb('err');
				}
			}
			request.open('GET', scriptUrl, true);  
			request.send();
		} else {
			this.loadFromGithuAPI(scriptUrl, function(content) {
				cb(content);
			});
		}
	}
}

Worker.prototype.importSiteContent = function (res) {
	var scriptType = 'instaedit/rawdata';

	this.importSiteContentFromMetaTag(scriptType, this.getMetaContent('instaeditsource'), function (content) {
		if(content == 'err') {
			content = Worker.prototype.importSiteContentFromScriptTag(scriptType);
		}

		res(content);
	});
}

Worker.prototype.getSiteContent = function (done) {
	if(typeof this.siteContent == "undefined") {
		this.importSiteContent(function (res) {
			this.siteContent = res;
			done();
		});
	} else {
		done(this.siteContent);
	}
}

Worker.prototype.performEditor = function () {
	if(document.location.href.replace('.com') != document.location.href) {
		var editor = window.open('editor.html', 'Instaedit editor');
	} else {
		var editor = window.open('../src/editor.html', 'Instaedit editor');
	}

	editor.focus();
}

Worker.prototype.load = function (cb) {
	console.log('Worker loaded');
	this.getSiteContent(function () {
		console.log('Site content loaded');
		Worker.prototype.getParserCode(Worker.prototype.getMetaContent('instaeditparser'), function (code) {
			console.log('ParserCode loaded');
			this.parserCode = code;

			cb(this.siteContent, this.parserCode);
		});	
	});
}

var InstaeditWorker = new Worker();
InstaeditWorker.load(function (site, parser) {
	InstaeditWorker.siteContent = site;
	InstaeditWorker.parserCode = parser;

	InstaeditWorker.performEditor();
});