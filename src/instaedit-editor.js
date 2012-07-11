// send logs also to instaedit
window.console.originalLog = window.console.log;
window.console.log = function() {
  window.console.originalLog.apply(this, arguments);
  instaedit.editorLog.apply(this, arguments);
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