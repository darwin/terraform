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
  var self = this;
  var applyButton = document.getElementById('apply');
  applyButton.style.visibility = 'hidden';

  applyButton.onclick = function () {
    console.log("apply clicked!");
    self.updateParserCode();
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