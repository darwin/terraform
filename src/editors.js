var EditorsManager = function () {};

EditorsManager.editor = {};
EditorsManager.appliedDirectives = {};
EditorsManager.markers = [];

EditorsManager.prototype.addMarker = function (start, stop) {
  var Range = require('ace/range').Range;

  var range = new Range(start, 0, stop, 0);
  var marker = this.getEditor().parserEditor.getSession().addMarker(range, "parser-selected", "line");

  newMarker = {};
  newMarker.start = start;
  newMarker.stop = stop;
  EditorsManager.markers.push(newMarker);
}

EditorsManager.prototype.removeAllMarkers = function (start, stop) {
  var Range = require('ace/range').Range;
  var markers = EditorsManager.markers;

  for(var i in markers) {
    console.log('Removing marker from ' + markers[i].start + ' to ' + markers[i].stop)
    var range = new Range(markers[i].start, 0, markers[i].stop, 0);
    this.getEditor().parserEditor.getSession().removeMarker(range);
    delete EditorsManager.markers[i];
  }
}

EditorsManager.prototype.setEditor = function (val) {
  this.editor = val;
}

EditorsManager.prototype.getEditor = function () {
  return this.editor;
}

EditorsManager.prototype.updateParserCode = function (code) {
  var compiled = this.compileParser(this.getEditor().parserEditor.getSession().getValue(), this.getActualContentFile(), window.opener.location.toString().split('/')[window.opener.location.toString().split('/').length - 1]);
  var markers = this.identifyBlockInParserCode(this.getEditor().parserEditor.getSession().getValue());

  this.removeAllMarkers();

  for (i in markers) {
    console.log('Creating marker from ' + markers[i].start + ' to ' + markers[i].stop);
    this.addMarker(markers[i].start, markers[i].stop);
  }

  instaedit.setParserCode(compiled);
  instaedit.evalParser();
}

EditorsManager.prototype.addSelectListOption = function (elementName, value) {
  var option = document.createElement('option');
  option.setAttribute('value', value.toLowerCase());
  console.log('Adding option ' + value + ' -> ' + value.replace('https://raw.github.com', ''))
  option.innerHTML = value.replace('https://raw.github.com', '');

  var list = document.getElementById(elementName);
  list.appendChild(option);
}

EditorsManager.prototype.trim = function (str) {
  var trimed = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

EditorsManager.prototype.compileParser = function (code, actualFile, actualLocation) {
  console.log('Compile parser for ' + actualFile + ' in context of ' + actualLocation);
  // Identify unapplicable blocks
  // Get all "Apply when directives"
  var applyWhen = code.split('// -> Apply when editing ');
  var applyFilters = {};
  if(applyWhen.length > 0) {
    for(var i in applyWhen) {
      var j = parseInt(i) + 1;
      if(typeof applyWhen[j] != 'undefined') {
        applyWhen[j] = applyWhen[j].split('// <-')[0];
        var name = applyWhen[j].split('\n')[0];
        var context = '';

        if(name != name.split(' in context of ')) {
          context = name.split(' in context of ')[1];
          name = name.split(' in context of ')[0];
        }

        applyFilters[name] = {};
        applyFilters[name].code = applyWhen[j].split(applyWhen[j].split('\n')[0]).join('');
        applyFilters[name].context = context;
      }
    }
  }

  // Replace unmatched "Apply when" directives
  for(var i in applyFilters) {
    if((i != actualFile) || ((applyFilters[i].context != actualLocation) && (applyFilters[i].context != ''))) {
      if(applyFilters[i].context == '') {
        directive = this.trim('// -> Apply when editing ' + i);
      } else {
        directive = this.trim('// -> Apply when editing ' + i + ' in context of ' + applyFilters[i].context);
      }

      code = code.split(directive + applyFilters[i].code + '// <-').join('');

      delete applyFilters[i];
    }
  }

  // Get count of applied directives
  var count = 0;
  for(var p in applyFilters) if(applyFilters.hasOwnProperty(p))++count;

  if(count != 0) {
    console.log('Matched some directive - general directive will no be longer needed.');
    directive = code.split('// -> General directive')[1].split('// <-')[0];

    code = code.split('// -> General directive').join('');
    code = code.split(directive).join('');
  } else {
    console.log('No directive matched - general directive should take its place.');
  }

  code = code.split('\n\n\n').join('\n');
  this.appliedDirectives = applyFilters;

  return code;
}

EditorsManager.prototype.identifyBlockInParserCode = function (code) {
  console.log('Identify ' + code + ' in ');
  console.log(this.appliedDirectives);

  var a = code.split('\n');
  var b = this.appliedDirectives;

  var blocks = {};

  // Identify blocks
  for (var i in a) {
    // Is line start of any block?
    if(this.trim(a[i]).split('// -> Apply when editing ').length != 1) {
      var rule = this.trim(a[i]).split('// -> Apply when editing ')[1].split(' ')[0];
      blocks[rule] = {};
      blocks[rule].start = parseInt(i);
      console.log('Found rule for ' + rule + ' block is starting at ' + i);
    }
  }

  // Found blocks ends
  for (var i in blocks) {
    var rest = code.split(a[blocks[i].start])[1];
    rest = rest.split('// <-')[0];
    rest = rest.split('\n');
    blocks[i].stop = blocks[i].start + rest.length;
    console.log('Found rule end for ' + i + ' block is ending at ' + rest.length);
  }

  for (var i in blocks) {
    if(typeof b[i] != 'object') {
      delete blocks[i];
    }
  }
/*
  if(starts.length != 0) {
    for (var i in starts) {
       var line = code.split('\n')[starts[i]];
       var block = code.split(line)[1];
       var block = block.split('// ->')[0];
       var blockLength = block.split('\n').length;
       stops.push(parseInt(starts[i]) + 1 + blockLength);
    }
  }
*/
console.log(blocks);

  return blocks;
}

EditorsManager.prototype.handleApplyButton = function () {
  var self = this;
  var applyButton = document.getElementById('apply');
  applyButton.style.visibility = 'hidden';

  applyButton.onclick = function () {
    console.log("apply clicked!");
    self.updateParserCode(self.getEditor().parserEditor.getSession().getValue());
  }
}

EditorsManager.prototype.setUpEditors = function () {
  var coffeescript = true;

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

  if(coffeescript) {
    parsereditor.getSession().setMode("ace/mode/coffee");
  } else {
    parsereditor.getSession().setMode("ace/mode/javascript");
  }
  


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
  var self = this;

  // Editor stuff
  addEventListener('keyup', function () {
    console.log("updating content...");
    instaedit.updateDataContent(self.getActualContentFile(), self.getEditor().contentEditor.getSession().getValue());
    instaedit.evalParser();
  });
}

EditorsManager.prototype.getActualContentFile = function () {
  return document.getElementById('select-file-selectbox').value;
}

EditorsManager.prototype.handleFileChooseBehavior = function (self) {
  // Divide
  var origins = instaedit.getDataOrigins();
  var that = self;
  for(var i in origins) {
    self.addSelectListOption('select-file-selectbox', origins[i]);
  }
  instaedit.setActualContentFile(that.getActualContentFile());

  // Impera
  var contents = instaedit.getDataContents();
  document.getElementById('select-file-selectbox').onfocus = function () {
    console.log('Saving actual version.');
    instaedit.updateDataContent(that.getActualContentFile(), that.getEditor().contentEditor.getSession().getValue());
  }

  document.getElementById('select-file-selectbox').onchange = function () {
    console.log('Switching file to ' + that.getActualContentFile());

    that.getEditor().contentEditor.getSession().setValue(contents[that.getActualContentFile()]);
    instaedit.setActualContentFile(that.getActualContentFile());
  }
}

EditorsManager.prototype.loadCoffee = function (cb) {
  instaedit.addScript('../libs/coffee/underscore.js', function () {
    instaedit.addScript('../libs/coffee/coffeescript.js', function () {
      instaedit.addScript('../libs/coffee/js2coffee.js', function () {
        console.log('Script js2coffee.js loaded.')
        cb();
      });
    });
  });
}

EditorsManager.prototype.init = function () {
  var self = this;
  this.loadCoffee(function () {
    self.setUpEditors();
    self.updateParserCode(self.getEditor().parserEditor.getSession().getValue());
    self.handleApplyButton();
    self.handleParserEditorBehavior(self);
    self.handleContentEditorBehavior(self);
    self.handleFileChooseBehavior(self);
  });
}