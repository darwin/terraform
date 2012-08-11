// create a default config if not provided
if (typeof InstaEditConfig == "undefined") {
  var InstaEditConfig = {
    defScope: this, // scope where we define instaedit object
    evalScope: this, // target scope where we eval parser code
    logScope: this // scope where we expect console.log for editor logging
  };
}

// make our stuff private, the only exported variable will be instaedit into InstaEditConfig.defScope
(function(config) {
  var content;
  var code;
  var editor;
  var contentSourceUrl;
  var actualNotification;
  var dataOrigins = new Array();
  var dataContents = {};
  var parserOrigin;
  var actualContentFile;
  var coffeeScriptParser;

  var setActualContentFile = function (fileName) {
    actualContentFile = fileName;
  }

  var getActualContentFile = function (fileName) {
    return actualContentFile;
  }

  var getParserCode = function() {
    return code;
  }

  var setParserCode = function(newCode) {
    code = newCode;
  }

  var setParserOrigin = function(code) {
    parserOrigin = code;
  }
  
  var getParserOrigin = function() {
    return parserOrigin;
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

  var getContentSourceUrl = function () {
    return getMetaContent('instaeditsource');
  }

  var addDataOrigin = function (origin) {
    dataOrigins.push(origin);
  }

  var addDataContent = function (name, content) {
    dataContents[name] = content;
  }

  var updateDataContent = function (name, content) {
    console.log('Updating content of ' + name);
    dataContents[name] = content;
  }

  var getDataOrigins = function () {
    return dataOrigins;
  }

  var getDataContents = function () {
    return dataContents;
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
                console.log('Data from github with url ' + originUrl + ' received.');
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

  var importSiteContentFromMetaTag = function (scriptUrl, cb) {
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
  
  var fetchSiteContent = function (url, res, indexed) {
    importSiteContentFromMetaTag(url, function (content) {

      if((typeof indexed != 'undefined') && (indexed == true)) {
        var data = {};
        data.name = url;
        data.content = content;
        res(data);
      } else {
        res(content);
      }
    });
  }

  var fetchParserCode = function (scriptUrl, cb) {
    loadFromGithuAPI(scriptUrl, function (code) {
      if(scriptUrl.split('.')[scriptUrl.split('.').length - 1] == 'coffee') {
        console.log('coffeescript recognized' + scriptUrl + ' in ' + scriptUrl.split('.')[scriptUrl.split('.').length - 1]);
        coffeeScriptParser = true;
      } else {
        console.log('coffeescript not recognized' + scriptUrl + ' in ' + scriptUrl.split('.')[scriptUrl.split('.').length - 1]);
        coffeeScriptParser = false;
      }
      cb(code);
    });
  }
  
  var openEditor = function() {
    console.log('Opening editor.');
    var editor = window.open('editor.html', 'Instaedit editor');

    editor.instaedit = instaedit;
    editor.focus();
  }

  var hasOwnContentScript = function (file) {
    var scripts = new Array();
    var elements = getElementsWithAttribute('data-script-target');
    for(var i in elements) {
      if(elements[i].getAttribute('data-script-target') == file) {
        return elements[i].innerText;
      }
    }
    return false;
  }
  
  var evalParser = function() {
    var tempVarName = "__instaedit_gen_" + Math.floor(Math.random() * 5000);
    postfix = "})(" + tempVarName + ")";

    if(!hasOwnContentScript(actualContentFile)) {
      prefix = "(function(contents){";
      config.evalScope[tempVarName] = dataContents;
      var parserCode = getParserCode();
    } else {
      prefix = "(function(content){";
      config.evalScope[tempVarName] = dataContents[actualContentFile];
      var parserCode = hasOwnContentScript(actualContentFile);
    }

    if(coffeeScriptParser) {
      parserCode = CoffeeScript.compile(parserCode, { bare: "on" });

      console.log('Errors found during coffeescript compilation: ');
      console.log($("#coffee2js .error").show());
    }

    var code = prefix + '\n' + parserCode + '\n' + postfix;
    

    // eval in wrapper function using global temporary variable
    // TODO: alternatively we could encode site content into postfix as a parameter string
    try {
      config.evalScope.eval(code);
    } catch (ex) {
      if (editor && editor.onError) {
        editor.onError(ex);
      }
    }
    delete config.evalScope[tempVarName];

    var parser = document.getElementById('instaedit-parser-container');
    parser.innerHTML = getParserCode();
  }

  var displayNotification = function (text, kind, target) {
    if(typeof target == 'undefined') {
      target = document;
    }

    if(typeof actualNotification != 'undefined') {
      actualNotification.style.visibility = 'hidden';
    }

    var uid = Math.random() * 10000;
    var notificationElemId = 'instaedit-notification-' + parseInt(uid);
    var notificationTextElemId = 'instaedit-notification-text' + parseInt(uid);

    var doc = target.getElementsByTagName('body')[0];

    var notification = target.createElement('div');
    notification.setAttribute('id', notificationElemId);
    notification.setAttribute('class', 'instaedit-notification');
    doc.appendChild(notification);

    var notification = target.getElementById(notificationElemId);
    notification.innerHTML = '<span id="' + notificationTextElemId + '">' + text + '</span>';

    if(kind != 'error') {
      notification.style.background = "-webkit-linear-gradient(#636363, #030303)";
      notification.style.background = "linear-gradient(#636363, #030303)";
    } else {
      notification.style.background = "-webkit-linear-gradient(#c40505, #840404)";
      notification.style.background = "linear-gradient(#c40505, #a90303)";
    }

    if(text.length > 100) {
      notification.style.width = "400px";
      notification.style.height = parseInt((2/3) * text.length) + "px";
      notification.style.textAlign = "left";
    } else {
      notification.style.width = "300px";
      notification.style.height = "90px";
      notification.style.textAlign = "center";
    }

    notification.style.border = "1px solid #000000";
    notification.style.position = "absolute";
    notification.style.top = "5px";
    notification.style.right = "10px";
    notification.style.borderRadius = "6px";
    notification.style.wordWrap = "break-word";

    var notification_text = target.getElementById(notificationTextElemId);

    if(text.length > 100) {
     notification_text.style.left = '25px'; 
     notification_text.style.right = '25px';
     notification_text.style.paddingRight = '25px'; 
    }

    notification_text.style.color = 'white';
    notification_text.style.position = 'relative';
    notification_text.style.top = '20px';
    notification_text.style.paddingTop = '40px';
    notification_text.style.fontFamily = 'HelveticaNeueBold, HelveticaNeue-Bold, Helvetica Neue Bold, "HelveticaNeue", "Helvetica Neue", "TeXGyreHerosBold", "Helvetica", "Tahoma", "Geneva", "Arial", sans-serif';

    notification_text.style.fontWeight = '600'; 
    notification_text.style.fontStretch = 'normal';

    notification_text.style.textShadow = 'rgba(0,0,0,0.5) -1px 0, rgba(0,0,0,0.3) 0 -1px, rgba(255,255,255,0.5) 0 1px, rgba(0,0,0,0.3) -1px -2px';

    notification_text.style.fontSize = '13px';

    description = notification_text.childNodes.description;
    if(typeof description != 'undefined') {
      description.style.position = 'relative';
      description.style.top = '10px';
      description.style.left = '20px';
      description.style.width = '250px';
    }

    actualNotification = notification;

    setTimeout(function () {
      notification.style.visibility = 'hidden';
    }, 3000);
}
  var getElementsWithAttribute = function (name) {
    var body = document.getElementsByTagName('body');
    var body = body[0];
    var elements = new Array();

    for(var i in body.childNodes) {
      if(body.childNodes[i].nodeType == 1) {
        if(body.childNodes[i].getAttribute(name) != null) {
          elements.push(body.childNodes[i]);
        }
      }
    }

    return elements;
  }

  var fetchDataOrigins = function (cb)  {
    var origins = new Array();
    var elements = getElementsWithAttribute('data-origin');
    for(var i in elements) {
      var origin = elements[i].getAttribute('data-origin');
      addDataOrigin(origin)
      origins.push(origin);
    }

    cb(origins);
  }

  var fetchData = function (repo, origins, cb)  {
    for(var i in origins) {
      fetchSiteContent(repo + origins[i], function (content) {
        addDataContent(content.name.replace(getMetaContent('instaedit-repo'), ''), content.content);
        console.log('Content of ' + content.name + ' successfully fetched.');
      }, true);
    }
    cb();
  }

  var createScriptTagForParserCode = function (origin, code) {
    var head = document.getElementsByTagName('head')[0];
    var scr = document.createElement('script');
    scr.setAttribute('type', 'instaedit/content-script');
    scr.setAttribute('data-origin', origin);
    scr.setAttribute('data-application', 'instaedit');
    scr.setAttribute('id', 'instaedit-parser-container');
    head.appendChild(scr);
  }

  var bootstrap = function (cb) {
    console.log('Worker loaded');

    addScript('https://raw.github.com/binaryage/instaedit/master/demo/js/Markdown.Converter.js', function () {
      console.log('Markdown converter loaded.');
    });

    displayNotification('Instaedit is booting.', 'notification');

    var repo = getMetaContent('instaedit-repo');

    fetchDataOrigins(function (origins) {
      fetchData(repo, origins, function () {
        console.log('Data loading finished');
      });

      fetchSiteContent(repo + origins[0], function (content) {
        if(content == 404) {
          console.log('Site source is undefined in meta tag.');
          displayNotification('Site source is undefined in meta tag.', 'error');
        } else {
          console.log('Site content loaded');
          fetchParserCode(getMetaContent('instaedit-parser'), function (code) {
            console.log(code);
            if(code == 404) {
              console.log('Parser is undefined in meta tag.');
              displayNotification('Parser is undefined in meta tag.', 'error');
            } else {
              console.log('ParserCode loaded');
              createScriptTagForParserCode(getMetaContent('instaedit-parser'), code);
              cb(content, code);
            }
          });
        }
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
    setActualContentFile: setActualContentFile,
    editorLog: editorLog,
    getSiteContent: getSiteContent,
    setSiteContent: setSiteContent,
    getDataOrigins: getDataOrigins,
    getParserCode: getParserCode,
    setParserCode: setParserCode,
    getDataContents: getDataContents,
    updateDataContent: updateDataContent,
    evalParser: evalParser,
    setEditor: setEditor,
    displayNotification: displayNotification,
    getEditor: getEditor,
    getContentSourceUrl: getContentSourceUrl,
    fetchParserCode: fetchParserCode,
    getParserOrigin: getParserOrigin,
    coffeeScriptParser: coffeeScriptParser,
    addScript: addScript
  };

  // export public interface into selected scope
  if (config.defScope) {
    config.defScope.instaedit = instaedit;
  }
  
  // perform intial editor bootstraping, this enables user to call it later by hand via instaedit.bootstrap() if needed
  if (!config.preventBootstrapping) {
    bootstrap(function (site, parser) {
      if((content != 404) || (code != 404)) {
        parser
        setParserOrigin(parser);
        setParserCode(parser);
        setSiteContent(site);
        openEditor();
      }
    });
  }
})(InstaEditConfig);