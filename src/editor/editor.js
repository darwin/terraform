// send logs also to terraformed page
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  terraform.logger.apply(this, arguments);
};

$(function() {
  console.log("Editor loaded.");
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
});