// send logs also to instaedit
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  instaedit.editorLog.apply(this, arguments);
}

var editor;

function setCookie(name, value, expires) {
  var expires = new Date();
  expires.setDate(expires.getDate() + expires);
  var value = escape(value) + ((expires == null) ? "" : "; expires=" + expires.toUTCString());
  document.cookie = name + "=" + value;
}

function getCookie(name)
{
  var i, x, y, ARRcookies = document.cookie.split(";");

  for(i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x = x.replace(/^\s+|\s+$/g,"");
    if(x == name) {
        return unescape(y);
    }
  }
}

function checkIfSignedToGithub() {
  if(!instaedit.signedToGithub) {
    var request = new XMLHttpRequest();

    request.open('GET', 'http://instaedit-server.herokuapp.com/getcode', true);
    request.send();

    request.onloadend = function () {
      console.log(request.responseText);
      var response = JSON.parse(request.responseText);

      console.log(response);
      if(response.result == 'found') {
        setCookie('gh-token', response.token, 14);
        setGithubToken(response.token);
      } else {
        console.log('Not logged yet.');
      }
    }
  }
}

function updateParserCode() {
  instaedit.setParserCode(editor.parsereditor.getSession().getValue());
  instaedit.evalParser();
}

function handleApplyButton () {
  console.log('applying');
  var applyButton = document.getElementById('apply');
  applyButton.style.visibility = 'hidden';

  applyButton.onclick = function () {
    console.log("apply clicked!");
    updateParserCode();
  }
}

function setUpEditors() {
  var data = {};
  var siteContent = instaedit.getSiteContent();
  var parserScript = instaedit.getParserCode();

  var parserEditorElem = document.getElementById('parsereditor');
  var contentEditor = document.getElementById('editor');

  contentEditor.innerHTML = siteContent;
  parserEditorElem.innerHTML = parserScript;

  var contentEditor = ace.edit("editor");
  var parsereditor = ace.edit("parsereditor");

  parsereditor.getSession().setMode("ace/mode/javascript");

  contentEditor.resize();
  parsereditor.resize();

  data.contentEditor = contentEditor;
  data.parserEditorElem = parserEditorElem;
  data.parsereditor = parsereditor;
  data.parserScript = parserScript;
  data.siteContent = siteContent;
  data.contentEditor = contentEditor;
  data.onError = handleError;
  
  editor = data;
  
  instaedit.setEditor(editor);
}

function toggleParserEditor() {
  console.log('toggling');
  var parserEditorWrapper = document.getElementById('parsereditor');
  var contentEditor = document.getElementById('editor');
  var applyButton = document.getElementById('apply');

  if(parserEditorWrapper.style.visibility == 'hidden') {
    console.log('up');
    parserEditorWrapper.style.visibility = 'visible';
    applyButton.style.visibility = 'visible';

    contentEditor.style.height = '360px';
  } else {
    console.log('down');
    parserEditorWrapper.style.visibility = 'hidden';
    applyButton.style.visibility = 'hidden';

    contentEditor.style.height = '695px';
  }
}

function handleError(err) {
  console.log('error occurred', err, err.stack);

  instaedit.displayNotification(err + '<div id="description">' + err.stack + '</div>', 'error', document);
/*
  var errorWindow = document.getElementById('error-info');
  errorWindow.innerHTML = '<div class="error">' + err + '</div>';
  errorWindow.style.visibility = 'visible';
*/
}

function setGithubToken(token) {
  console.log('Received auth data.');
  instaedit.signedToGithub = true;
  instaedit.displayNotification('Succesfully logged to github with token ' + token, 'notification');
  instaedit.githubToken = token;
  document.getElementById('commit').innerHTML = 'Commit';
}

window.onresize = function(event) {
  console.log('Editor resizing.');
   editor.contentEditor.resize();
   editor.parsereditor.resize();
}

window.onload = function() {
  setUpEditors();

  updateParserCode();
  handleApplyButton();

  document.getElementById('parsereditor').style.visibility = 'hidden';

  addEventListener('keyup', function () {
    console.log("updating content...");
    var content = editor.contentEditor.getSession().getValue();
    instaedit.setSiteContent(content);
    instaedit.evalParser();
  });

  document.getElementById('editparser').onclick = function () {
    toggleParserEditor();
    editor.contentEditor.resize();
    editor.parsereditor.resize();
  }

  if(typeof getCookie('gh-token') == 'undefined') {
    document.getElementById('commit').innerHTML = 'Github login';
    instaedit.signedToGithub = false;
  } else {
    instaedit.signedToGithub = true;
  }

  document.getElementById('commit').onclick = function () {
    if(instaedit.signedToGithub) {
      instaedit.addGithubJS(function () {
        instaedit.githubCommit(editor.contentEditor.getSession().getValue(), instaedit.githubToken, instaedit.contentSourceUrl , function (res) {
          if(res != 'err') {
            instaedit.displayNotification('Succesfully commited.', 'notification');
          } else {
            instaedit.displayNotification('Unkown error occurred during commit.', 'error');
          }
        });
      });
    } else {
      window.open('http://instaedit-server.herokuapp.com/login/');
      setInterval(checkIfSignedToGithub(), 3000);
    }
  }
}