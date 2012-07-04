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
  var githubToken;
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

  var getContentSourceUrl = function () {
    return getMetaContent('instaeditsource');
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

  var githubJS = function (username) {
    gh.authenticate(username, githubToken);
  }

  function _request(method, path, data, token, cb) {
    $.ajax({
        type: method,
        url: path,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        success: function(res) { cb(null, res); },
        error: function (request, status, error) {
          jQuery.parseJSON( request.responseText );
          console.log(status);
        },
        headers : 'Authorization: token ' + token
    });
  }

  var githubCommit = function (data, code, url, cb) {
    var url = url.replace('https://', '').replace('raw.github.com/', '').split('/');
    var username = url[0];
    var repoName = url[1];
    var branch = url[2];
    
    var path = '';
    for (var i in url) {
      if(i > 2) {
        path += url[i] + '/';
      }
    };


    console.log('User: ' + username + ', Repo: ' + repoName + ', Branch: ' + branch + ', Path: ' + path);
    githubJS(username);
    
    var user = gh.user(username);
    var message = 'Content update of ' + path.split('/')[path.split('/').length - 2] + ' - comitted from web with Instaedit.';
    var repo = gh.repo(user, repoName);

    var url = 'https://api.github.com/repos/' + username + '/' + repoName + '/git/refs/heads/' + branch;
    jQuery.getJSON(url + "?callback=?", {}, function(response) {
      postData = {};
//    postData.login = username;
//    postData.token = code;
      postData.parent_commit = response.data.object.sha;
      postData.message = message;
      
      postData.content = {};
      postData.content.path = path;
      postData.content.mode = 'edit';
      postData.content.data = data;

      console.log(JSON.stringify(postData));

      var url = 'http://github.com/api/v2/json/' + username + '/' + repoName + '/git/commits/';
/*
      _request('POST', url, postData, code, function (err, res) {
        console.log('res');
        console.log(err.toString());
        console.log(err);
        console.log(res);
        cb();
      })
*/
      /*
      *  TODO Returning 404
       *   -> http://swanson.github.com/blog/2011/07/23/digging-around-the-github-api-take-2.html
       */

       var blobData = {};
       blobData.content = data;
       blobData.encoding = 'utf-8';
       // Create blob
       var url = 'http://github.com/api/v2/json/repos/' + username + '/' + repoName + '/git/blobs';
/*
       _request('POST', url, blobData, code, function (err, res) {
          console.log('res');
          console.log(err.toString());
          console.log(err);
          console.log(res);
        });
*/

        var github = new Github({
          token: code,
          username: username,
          auth: "oauth"
        });
    
        var user = github.getUser(username);
        var repo = new Github.Repository({user: username, name: repoName});

        repo.write(branch, path, data, message, response.data.object.sha, function (res) {
          console.log(res);
        });
    });

  }

  var addGithubJS = function (cb) {
    addScript('https://raw.github.com/fitzgen/github-api/master/github.js', function () {
      addScript('../libs/github/github.js', function () {
        cb();
      });
    });
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

  // By Fitzgerald 2009 - http://fitzgeraldnick.com/ - Thank you for it!
  var post = function (url, vals) {
        var
        form = document.createElement("form"),
        iframe = document.createElement("iframe");

        // Need to insert the iframe now so contentDocument and contentWindow are defined
        document.body.appendChild(iframe);

        var
        doc = iframe.contentDocument !== undefined ?
            iframe.contentDocument :
            iframe.contentWindow.document,
        key, field;
        vals = vals || {};

        form.setAttribute("method", "post");
        form.setAttribute("action", url);
        for (key in vals) {
            if (vals.hasOwnProperty(key)) {
                field = document.createElement("input");
                field.type = "hidden";
                field.value = encodeURIComponent(vals[key]);
                form.appendChild(field);
            }
        }

        iframe.setAttribute("style", "display: none;");
        doc.body.appendChild(form);
        form.submit();
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
    console.log('Opening editor.');
    var editor = window.open('editor.html', 'Instaedit editor');

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

  var displayNotification = function (text, kind, target) {
    if(typeof target == 'undefined') {
      target = document;
    }

    var uid = Math.random() * 10000;
    var notificationElemId = 'instaedit-notification-' + parseInt(uid);
    var notificationTextElemId = 'instaedit-notification-text' + parseInt(uid);

    var doc = target.getElementsByTagName('body')[0];

    var notification = target.createElement('div');
    notification.setAttribute('id', notificationElemId);
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

    if(text.length > 200) {
      notification.style.width = "400px";
      notification.style.height = parseInt((2/3) * text.length) + "px";
      notification.style.textAlign = "left";
    } else {
      notification.style.width = "300px";
      notification.style.height = "70px";
      notification.style.textAlign = "center";
    }

    notification.style.border = "1px solid #000000";
    notification.style.position = "absolute";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.borderRadius = "6px";

    var notification_text = target.getElementById(notificationTextElemId);

    if(text.length > 200) {
     notification_text.style.left = '25px'; 
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

    setTimeout(function () {
      notification.style.visibility = 'hidden';
    }, 3000);
}

  var bootstrap = function (cb) {
    console.log('Worker loaded');

    displayNotification('Instaedit is booting.', 'notification');
    fetchSiteContent(getContentSourceUrl(), function (content) {
      if(content == 404) {
        displayNotification('Site source is undefined in meta tag.', 'error');
      } else {
        console.log('Site content loaded');
        fetchParserCode(getMetaContent('instaeditparser'), function (code) {
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
    getEditor: getEditor,
    addGithubJS: addGithubJS,
    getContentSourceUrl: getContentSourceUrl
  };

  // export public interface into selected scope
  if (config.defScope) {
    config.defScope.instaedit = instaedit;
  }
  
  // perform intial editor bootstraping, this enables user to call it later by hand via instaedit.bootstrap() if needed
  if (!config.preventBootstrapping) {
    bootstrap(function (site, parser) {
      if((content != 404) || (code != 404)) {
        setParserCode(parser);
        setSiteContent(site);
        openEditor();
      }
    });
  }
})(InstaEditConfig);