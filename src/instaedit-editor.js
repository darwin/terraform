// send logs also to instaedit
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  instaedit.editorLog.apply(this, arguments);
}

var editor;

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
  var errorWindow = document.getElementById('error-info');
  errorWindow.innerHTML = '<div class="error">' + err + '</div>';
  errorWindow.style.visibility = 'visible';
}

// TODO: this is probably buggy
// window.onresize = function(event) {
//   setUpEditors();
// }

window.onload = function() {
  setUpEditors();

  updateParserCode();
  handleApplyButton();

  addEventListener('keyup', function () {
    console.log("updating content...");
    var content = editor.contentEditor.getSession().getValue();
    instaedit.setSiteContent(content);
    instaedit.evalParser();
  });

  var parserEditorWrapper = document.getElementById('parsereditor');
  parserEditorWrapper.style.visibility = 'hidden';

  var parserEditButton = document.getElementById('editparser');
  parserEditButton.onclick = function () {
    toggleParserEditor();
    editor.contentEditor.resize();
    editor.parsereditor.resize();
  }

  var parserEditButton = document.getElementById('commit');
  parserEditButton.onclick = function () {
    alert('Feature not yet supported but you can manually paste that to your site: ' + '\n' + '\n' + editor.getSession().getValue());
  }
}