var EditorsManager = function () {};

EditorsManager.editor = {};

EditorsManager.prototype.setEditor = function (val) {
  this.editor = val;
}

EditorsManager.prototype.getEditor = function () {
  return this.editor;
}

EditorsManager.prototype.updateParserCode = function () {
  instaedit.setParserCode(this.getEditor().parserEditor.getSession().getValue());
  instaedit.evalParser();
}

EditorsManager.prototype.addSelectListOption = function (elementName, value) {
  var option = document.createElement('option');
  option.setAttribute('value', value.toLowerCase());
  option.innerHTML = value;

  var list = document.getElementById(elementName);
  list.appendChild(option);
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

  // Editors
  data.contentEditor = contentEditor;
  data.parserEditor = parsereditor;

  // Initial data
  data.parserScript = parserScript;
  data.siteContent = siteContent;
  data.onError = this.handleError;
  this.setEditor(data);
  
  instaedit.setEditor(data);
}

EditorsManager.prototype.toggleParserEditor = function () {
  console.log('toggling');
  var parserEditor = document.getElementById('parsereditor');
  var contentEditor = document.getElementById('editor');
  var applyButton = document.getElementById('apply');

  if(parserEditor.style.visibility == 'hidden') {
    console.log('up');
    parserEditor.style.visibility = 'visible';
    applyButton.style.visibility = 'visible';

    var parserEditorHeight = (window.innerHeight * 0.4).toString() + 'px';
    var contentEditorHeight = (window.innerHeight * 0.6 - 60).toString() + 'px';

    console.log('Computing new heights of editors.');
    console.log('Parser editor ' + parserEditorHeight);
    console.log('Content editor ' + contentEditorHeight);

    parserEditor.style.height = (window.innerHeight * 0.4).toString() + 'px';
    contentEditor.style.height = (window.innerHeight * 0.6 - 60).toString() + 'px';
  } else {
    console.log('down');
    parserEditor.style.visibility = 'hidden';
    applyButton.style.visibility = 'hidden';

    contentEditor.style.height = (window.innerHeight - 60).toString() + 'px';
  }
}

EditorsManager.prototype.handleError = function (err) {
  console.log('error occurred', err, err.stack);

  instaedit.displayNotification(err + '<div id="description">' + err.stack + '</div>', 'error', document);
}

EditorsManager.prototype.handleParserEditorBehavior = function (self) {
  var editor = this.getEditor();

  // Parser editor stuff
  document.getElementById('parsereditor').style.visibility = 'hidden';

  document.getElementById('editparser').onclick = function () {
    self.toggleParserEditor();
    editor.contentEditor.resize();
    editor.parserEditor.resize();
  }
}

EditorsManager.prototype.handleContentEditorBehavior = function (self) {
  var editor = this.getEditor();
  console.log(editor);

  // Editor stuff
  addEventListener('keyup', function () {
    console.log("updating content...");
    var content = editor.contentEditor.getSession().getValue();
    instaedit.setSiteContent(content);
    instaedit.evalParser();
  });
}

EditorsManager.prototype.handleFileChooseBehavior = function (self) {
  // Divide
  var origins = instaedit.getDataOrigins();
  var that = self;
  for(var i in origins) {
    this.addSelectListOption('select-file-selectbox', origins[i]);
  }

  // Impera
  var contents = instaedit.getDataContents();
  document.getElementById('select-file-selectbox').onfocus = function () {
    console.log('Saving actual version.');
    instaedit.updateDataContent(document.getElementById('select-file-selectbox').value, that.getEditor().contentEditor.getSession().getValue());
  }

  document.getElementById('select-file-selectbox').onchange = function () {
    console.log('Switching file to ' + document.getElementById('select-file-selectbox').value);

    that.getEditor().contentEditor.getSession().setValue(contents[document.getElementById('select-file-selectbox').value]);
  }
}

EditorsManager.prototype.init = function () {
  this.setUpEditors();

  this.updateParserCode();
  this.handleApplyButton();
  this.handleParserEditorBehavior(this);
  this.handleContentEditorBehavior(this);
  this.handleFileChooseBehavior(this);
}