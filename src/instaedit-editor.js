// send logs also to instaedit
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  instaedit.editorLog.apply(this, arguments);
}

/*
window.onresize = function(event) {
  console.log('Editor resizing.');
  var Editors = new EditorsManager();
  Editors.getEditor().contentEditor.resize();
  Editors.getEditor().parserEditor.resize();
}
*/

window.onload = function() {
  var Editors = new EditorsManager();
  Editors.init();
}