// send logs also to instaedit
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  instaedit.editorLog.apply(this, arguments);
}

// -------------- Github auth --------------
var GithubAuth = function () {};

GithubAuth.signed = false;

GithubAuth.prototype.getCookieName = function () {
  return 'gh-token';
}

GithubAuth.prototype.isSigned = function ()  {
  return this.signed;
}

GithubAuth.prototype.setIsSigned = function (val)  {
  this.signed = val;
}

GithubAuth.prototype.getAuthServerURL = function () {
  return 'http://instaedit-server.herokuapp.com';
}

GithubAuth.prototype.storeTokenToCookies = function(token) {
  now = new Date();
  expires = new Date(now.getYear(), now.getMonth() + 1, 1);
  console.log('Storing token ' + token + ' which will expire in ' + expires);

  var expires = new Date();
  expires.setDate(expires.getDate() + expires);
  var token = escape(token) + ((expires == null) ? "" : "; expires=" + expires.toUTCString());
  document.cookie = this.getCookieName() + "=" + token;
}

GithubAuth.prototype.loadTokenFromCookies = function() {
  console.log('Looking for cookie ' + this.getCookieName());
  var i, x, y, ARRcookies = document.cookie.split(";");

  for(i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x = x.replace(/^\s+|\s+$/g,"");
    if(x == this.getCookieName()) {
        return unescape(y);
    }
  }
}

GithubAuth.prototype.checkIfSignedToGithub = function () {
  if(!instaedit.signedToGithub) {
    var self = this;
    var request = new XMLHttpRequest();

    request.open('GET', this.getAuthServerURL() + '/getCode', true);
    request.send();

    request.onloadend = function () {
      console.log(request.responseText);
      var response = JSON.parse(request.responseText);

      console.log(response);
      if(response.result == 'found') {
        var token = response.token;
        console.log(token);

        self.setGithubToken(token);
        self.setIsSigned(true);
      } else {
        console.log('Not logged yet.');
      }
    }
  }
}

GithubAuth.prototype.setGithubToken = function (token) {
  console.log('Received auth data.');

  this.storeTokenToCookies(token);
  instaedit.signedToGithub = true;
  instaedit.displayNotification('Succesfully logged to github with token ' + token, 'notification');
  instaedit.githubToken = token;
  document.getElementById('commit').innerHTML = 'Commit';
}

GithubAuth.prototype.init = function () {
  console.log(this.loadTokenFromCookies());
  console.log(typeof this.loadTokenFromCookies());

  if(typeof this.loadTokenFromCookies() == 'undefined') {
    document.getElementById('commit').innerHTML = 'Github login';
    instaedit.signedToGithub = false;
  } else {
    this.setIsSigned(true);
    instaedit.signedToGithub = true;
    instaedit.githubToken = this.loadTokenFromCookies();
  }
}

GithubAuth.prototype.performProcess = function () {
  window.open(this.getAuthServerURL() + '/login/', 'Instaedit github auth','width=600, height=500');
  setInterval(this.checkIfSignedToGithub(), 3000);
}

// ------------------------------------------------------------------------------------

var EditorsManager = function () {};

EditorsManager.editor = {};

EditorsManager.prototype.setEditor = function (val) {
  this.editor = val;
}

EditorsManager.prototype.getEditor = function () {
  return this.editor;
}

EditorsManager.prototype.updateParserCode = function () {
  instaedit.setParserCode(this.getEditor().parsereditor.getSession().getValue());
  instaedit.evalParser();
}

EditorsManager.prototype.handleApplyButton = function () {
  var applyButton = document.getElementById('apply');
  applyButton.style.visibility = 'hidden';

  applyButton.onclick = function () {
    console.log("apply clicked!");
    updateParserCode();
  }
}

EditorsManager.prototype.setUpEditors = function () {
  // Load data
  var siteContent = instaedit.getSiteContent();
  var parserScript = instaedit.getParserCode();

  // Set initial content
  var parserEditorElem = document.getElementById('parsereditor');
  var contentEditor = document.getElementById('editor');

  contentEditor.innerHTML = siteContent;
  parserEditorElem.innerHTML = parserScript;

  // Style it
  contentEditor.style.height = (window.innerHeight - 45).toString() + 'px';
  parserEditorElem.style.height = (window.innerHeight * 0.4 - 45).toString() + 'px';

  // Turn to ace editors
  var contentEditor = ace.edit("editor");
  var parsereditor = ace.edit("parsereditor");

  parsereditor.getSession().setMode("ace/mode/javascript");

  contentEditor.resize();
  parsereditor.resize();

  // Export data
  var data = {};
  data.contentEditor = contentEditor;
  data.parserEditorElem = parserEditorElem;
  data.parsereditor = parsereditor;
  data.parserScript = parserScript;
  data.siteContent = siteContent;
  data.contentEditor = contentEditor;
  data.onError = this.handleError;
  this.setEditor(data);
  
  instaedit.setEditor(data);
}

EditorsManager.prototype.toggleParserEditor = function () {
  console.log('toggling');
  var parserEditorWrapper = document.getElementById('parsereditor');
  var contentEditor = document.getElementById('editor');
  var applyButton = document.getElementById('apply');

  if(parserEditorWrapper.style.visibility == 'hidden') {
    console.log('up');
    parserEditorWrapper.style.visibility = 'visible';
    applyButton.style.visibility = 'visible';

    contentEditor.style.height = (window.innerHeight * 0.6 - 45).toString() + 'px';
  } else {
    console.log('down');
    parserEditorWrapper.style.visibility = 'hidden';
    applyButton.style.visibility = 'hidden';

    contentEditor.style.height = (window.innerHeight - 45).toString() + 'px';
  }
}

EditorsManager.prototype.handleError = function (err) {
  console.log('error occurred', err, err.stack);

  instaedit.displayNotification(err + '<div id="description">' + err.stack + '</div>', 'error', document);
/*
 * var errorWindow = document.getElementById('error-info');
 * errorWindow.innerHTML = '<div class="error">' + err + '</div>';
 * errorWindow.style.visibility = 'visible';
 */
}

EditorsManager.prototype.init = function () {
  var self = this;

  this.setUpEditors();

  this.updateParserCode();
  this.handleApplyButton();

  var editor = this.getEditor();

  // Parser editor stuff
  document.getElementById('parsereditor').style.visibility = 'hidden';

  document.getElementById('editparser').onclick = function () {
    self.toggleParserEditor();
    editor.contentEditor.resize();
    editor.parsereditor.resize();
  }

  // Editor stuff
  addEventListener('keyup', function () {
    console.log("updating content...");
    var content = editor.contentEditor.getSession().getValue();
    instaedit.setSiteContent(content);
    instaedit.evalParser();
  });
}

window.onresize = function(event) {
  console.log('Editor resizing.');
   this.getEditor().contentEditor.resize();
   this.getEditor().editor.parsereditor.resize();
}

window.onload = function() {
  var GHAuth = new GithubAuth();
  var Editors = new EditorsManager();

  GHAuth.init();
  Editors.init();

  // Github auth stuff
  document.getElementById('commit').onclick = function () {
    if(GHAuth.isSigned()) {
      instaedit.addGithubJS(function () {
        console.log(GHAuth.loadTokenFromCookies());
        instaedit.githubCommit(Editors.getEditor().contentEditor.getSession().getValue(), GHAuth.loadTokenFromCookies(), instaedit.getContentSourceUrl() , function (res) {
          if(res != 'err') {
            instaedit.displayNotification('Succesfully commited.', 'notification');
          } else {
            instaedit.displayNotification('Unkown error occurred during commit.', 'error');
          }
        });
      });
    } else {
      GHAuth.performProcess();
    }
  }
}