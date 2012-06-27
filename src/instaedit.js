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
  var githubAccessCode;
  var signedToGithub = false;
  var contentSourceUrl;
  
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

  var githubCommit = function (data, code, url, cb) {
    console.log('Storing given data to ' + url + ' with access code ' + code);
    cb('success'); 
  }

  var storeGithubCode = function (code, cb) {
    githubAccessCode = code;

    // TODO browser storage code storing implementation here
    cb('success');
  }

  var loadGithubCode = function () {
    // TODO browser storage code loading implementation here
    var code = 404;

    githubAccessCode = code;
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
    var content = 404;

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
      var user = url[3];
      var repo = url[4];
      var branch = url[5]

      if(url.length == 6) {
        var path = url[6];
      } else {
        var path = '';
        for(var i = 7; i <= url.length; i++) {
          path += '/' + url[i - 1];
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
    var content = 404;

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
        cb(404); // TODO: this is so ugly
      }
    }
    request.open('GET', scriptUrl, true);
    request.send();
  }
  
  var fetchSiteContent = function (url, res) {
    var scriptType = 'instaedit/rawdata';

    importSiteContentFromMetaTag(scriptType, url, function (content) {
      if(content == 404) {
        content = importSiteContentFromScriptTag(scriptType);
      }

      res(content);
    });
  }

  var fetchParserCode = function (scriptUrl, cb) {
    if(scriptUrl == 404) {
      cb(404);
    }

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
    var tempVarName = "__instaedit_gen_" + Math.floor(Math.random() * 5000);
    prefix = "(function(content){";
    postfix = "})(" + tempVarName + ")";

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

  var displayNotification = function (text, kind) {
  	console.log('Displaying ' + kind + ' ' + text);
    var doc = document.getElementsByTagName('body')[0];

    var notification = document.createElement('div');
    notification.setAttribute('id', 'instaedit-notification');
    doc.appendChild(notification);

    var notification = document.getElementById('instaedit-notification');
    notification.innerHTML = '<span id="instaedit-notification-text">' + text + '</span>';

    if(kind != 'error') {
      notification.style.background = "-webkit-linear-gradient(#636363, #030303)";
      notification.style.background = "linear-gradient(#636363, #030303)";
    } else {
      notification.style.background = "-webkit-linear-gradient(#c40505, #840404)";
      notification.style.background = "linear-gradient(#c40505, #a90303)";
    }

    notification.style.border = "1px solid #000000";
    notification.style.width = "300px";
    notification.style.height = "70px";
    notification.style.position = "absolute";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.textAlign = "center";
    notification.style.borderRadius = "6px";

    var notification_text = document.getElementById('instaedit-notification-text');
    notification_text.style.color = 'white';
    notification_text.style.position = 'relative';
    notification_text.style.top = '20px';
    notification_text.style.paddingTop = '40px';
    notification_text.style.fontFamily = 'HelveticaNeueBold, HelveticaNeue-Bold, Helvetica Neue Bold, "HelveticaNeue", "Helvetica Neue", "TeXGyreHerosBold", "Helvetica", "Tahoma", "Geneva", "Arial", sans-serif';

    notification_text.style.fontWeight = '600'; 
    notification_text.style.fontStretch = 'normal';

    notification_text.style.textShadow = 'rgba(0,0,0,0.5) -1px 0, rgba(0,0,0,0.3) 0 -1px, rgba(255,255,255,0.5) 0 1px, rgba(0,0,0,0.3) -1px -2px';

    notification_text.style.fontSize = '13px';

    setTimeout(function () {
      notification.style.visibility = 'hidden';
    }, 3000);
}

  var bootstrap = function (cb) {
    console.log('Worker loaded');

    loadGithubCode();
    if(githubAccessCode != 404) {
      signedToGithub = true;
    }

    displayNotification('Instaedit is booting.', 'notification');
    contentSourceUrl = getMetaContent('instaeditsource');
    fetchSiteContent(contentSourceUrl, function (content) {
      if(content == 404) {
        displayNotification('Site source is undefined in meta tag.', 'error');
      } else {
        console.log('Site content loaded');
        fetchParserCode(getMetaContent('instaeditparser'), function (code) {
          console.log(code);
          if(code == 404) {
            displayNotification('Parser is undefined in meta tag.', 'error');
          } else {
            console.log('ParserCode loaded');
            cb(content, code);
          }
        });
      }
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
    githubAccessCode: githubAccessCode,
    signedToGithub: signedToGithub,
    bootstrap: bootstrap,
    githubCommit: githubCommit,
    openEditor: openEditor,
    editorLog: editorLog,
    getSiteContent: getSiteContent,
    setSiteContent: setSiteContent,
    getParserCode: getParserCode,
    setParserCode: setParserCode,
    evalParser: evalParser,
    setEditor: setEditor,
    displayNotification: displayNotification,
    getEditor: getEditor
  };

  // export public interface into selected scope
  if (config.defScope) {
    config.defScope.instaedit = instaedit;
  }
  
  // perform intial editor bootstraping, this enables user to call it later by hand via instaedit.bootstrap() if needed
  if (!config.preventInitialLoad) {
    bootstrap(function (site, parser) {
      if((content != 404) || (code != 404)) {
        setParserCode(parser);
        setSiteContent(site);
        openEditor();
      }
    });
  }
})(InstaEditConfig);