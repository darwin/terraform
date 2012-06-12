var Worker = function () {};

Worker.siteContent = '';
Worker.editorContent = '';
Worker.parserCode = '';

Worker.prototype.trim = function trim(string) {
	return string.replace(/^\s+||\s+$/g, '');
}

Worker.prototype.importSiteContentFromScriptTag = function (scriptType) {
	var content = 'not found';

	metas = document.getElementsByTagName('script');
	for(var i in metas) {
		if(metas[i].type == scriptType) {
			content = metas[i].innerHTML;
		}		
	}

	return content;
}
 
Worker.prototype.loadFromGithuAPI = function (url) {
	console.log(url);
	return url;
}

Worker.prototype.getMetaContent = function (name) {
	var content = 'not found';

	metas = document.getElementsByTagName('meta');
	for(var i in metas) {
		if(metas[i].name == name) {
			content = metas[i].content;
		}		
	}

	return content;
}

Worker.prototype.getParserCode = function (scriptUrl, cb) {
	if(typeof scriptUrl != 'undefined') {
		var request = new XMLHttpRequest();  
		request.open('GET', scriptUrl, true);  
		request.send();  

		request.onloadend = function () { 
			cb(request.responseText);
		}
	}
}

Worker.prototype.importSiteContentFromMetaTag = function (scriptType, scriptUrl, cb) {
	if(typeof scriptUrl != 'undefined') {
		var request = new XMLHttpRequest();  
		request.open('GET', scriptUrl, true);  
		// request.send();  

		request.onloadend = function () { 
			if(request.statusCode == 200) {
				// cb(request.responseText);
				cb('err');
			} else {
				cb('err');
			}
		}
		cb('err');
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
		editor = window.open('editor.html', 'Instaedit editor');
	} else {
		editor = window.open('../src/editor.html', 'Instaedit editor');
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