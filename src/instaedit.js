// create a default config if not provided
if (typeof InstaEditConfig == "undefined") {
	var InstaEditConfig = {
		defScope: this, // scope where we define instaedit object
		evalScope: this, // target scope where we eval parser code
		logScope: this // scope where we expect console.log for editor logging
	};
}

// make our stuff private, the only exported variable will be instaedit into InstaEditConfig.scope
(function(config) {
	var content;
	var code;
	var editor;

	var getParserCode = function() {
		return code;
	}

	var setParserCode = function(newCode) {
		code = newCode;
	}

	var getSiteContent = function() {
		return content;
	}

	var setSiteContent = function(newContent) {
		content = newContent;
	}
	
	var getEditor = function() {
		return editor;
	}

	var setEditor = function(newEditor) {
		editor = newEditor;
	}

	var trim = function(string) {
		return string.replace(/^\s+||\s+$/g, '');
	}

	var httpRequest = function (url, cb) {
		var request = new XMLHttpRequest();	
		request.onloadend = function () { 
			cb(request.responseText);
		}
		request.open('GET', url, true);	
		request.send();
	}
	
	var addScript = function (name, cb) {
		var th = document.getElementsByTagName('head')[0];

		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.setAttribute('src', name);

		s.onload = function () {
			cb();
		}

		th.appendChild(s);
	}

	var addJQuery = function (data, cb) {
		if (typeof jQuery != 'undefined') {	
	 		console.log('jQuery already loaded.');
	 		cb(data);
		} else {
				addScript('https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function () {
					cb(data);
				});
		}
	}

	var importSiteContentFromScriptTag = function (scriptType) {
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

	var loadFromGithuAPI = function (url, cb) {
		addJQuery(url, function (url) {
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
								var data = decode64(data.data.content)
								cb(data);
							});
						}
					}
					});
			});
		});
	}

	var encode64 = function (input) {
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

	var decode64 = function (input) {
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

	var getMetaContent = function (name) {
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

	var importSiteContentFromMetaTag = function (scriptType, scriptUrl, cb) {
		// handle github specially
		var githubUrlRe = /github\.com/;
		if (githubUrlRe.test(scriptUrl)) {
			loadFromGithuAPI(scriptUrl, function(content) {
				cb(content);
			});
			return;
		}
		
		// standard path
		// TODO: this won't work because of CROSS-DOMAIN restrictons
		var request = new XMLHttpRequest();	
		request.onloadend = function () { 
			if(request.statusCode == 200) {
				cb(request.responseText);
			} else {
				cb('err'); // TODO: this is so ugly
			}
		}
		request.open('GET', scriptUrl, true);	
		request.send();
	}
	
	var fetchSiteContent = function (url, res) {
		var scriptType = 'instaedit/rawdata';

		importSiteContentFromMetaTag(scriptType, url, function (content) {
			if(content == 'err') {
				content = importSiteContentFromScriptTag(scriptType);
			}

			res(content);
		});
	}

	var fetchParserCode = function (scriptUrl, cb) {
		var request = new XMLHttpRequest();	
		request.onloadend = function () { 
			console.log(request.responseText);
			cb(request.responseText);
		}
		request.open('GET', scriptUrl, true);	
		request.send();	
	}
	
	var openEditor = function() {
		if(document.location.href.replace('.com') != document.location.href) {
			var editor = window.open('editor.html', 'Instaedit editor');
		} else {
			var editor = window.open('../src/editor.html', 'Instaedit editor');
		}
		editor.instaedit = instaedit;
		editor.focus();
	}
	
	var evalParser = function() {
		var tempVarName = "__instaedit_gen_"+Math.floor(Math.random()*5000);
		prefix = "(function(content){";
		postfix = "})("+tempVarName+")";
		var code = prefix + getParserCode() + postfix; 

		// eval in wrapper function using global temporary variable
		// TODO: alternatively we could encode site content into postfix as a parameter string
		config.evalScope[tempVarName] = getSiteContent();
		try {
			config.evalScope.eval(code);
		} catch (ex) {
			if (editor && editor.onError) {
				editor.onError(ex);
			}
		}
		delete config.evalScope[tempVarName];
	}

	var bootstrap = function (cb) {
		console.log('Worker loaded');
		// TODO: implement proper error handling when meta tags are not present...
		fetchSiteContent(getMetaContent('instaeditsource'), function (content) {
			console.log('Site content loaded');
			fetchParserCode(getMetaContent('instaeditparser'), function (code) {
				console.log('ParserCode loaded');
				cb(content, code);
			});	
		});
	}
	
	var editorLog = function() {
		if (!config.logScope) {
			return;
		}
		var args = Array.prototype.slice.call(arguments);
		args.unshift('InstaEditor:');
		config.logScope.console.log.apply(config.logScope.console, args);
	}

	// define public interface
	var instaedit = {
		bootstrap: bootstrap,
		openEditor: openEditor,
		editorLog: editorLog,
		getSiteContent: getSiteContent,
		setSiteContent: setSiteContent,
		getParserCode: getParserCode,
		setParserCode: setParserCode,
		evalParser: evalParser,
		setEditor: setEditor,
		getEditor: getEditor
	};

	// export public interface into selected scope
	if (config.defScope) {
		config.defScope.instaedit = instaedit;
	}
	
	// perform intial editor bootstraping, this enables user to call it later by hand via instaedit.bootstrap() if needed
	if (!config.preventInitialLoad) {
		bootstrap(function (site, parser) {
			setParserCode(parser);
			setSiteContent(site);
			openEditor();
		});
	}
})(InstaEditConfig);