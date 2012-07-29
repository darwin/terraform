// send logs also to instaedit
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  instaedit.editorLog.apply(this, arguments);
}

window.onresize = function(event) {
  console.log('Editor resizing.');
  var Editors = new EditorsManager();
  Editors.toggleParserEditor();
  Editors.toggleParserEditor();
}

window.onload = function () {
  var Editors = new EditorsManager();
  Editors.init();
}