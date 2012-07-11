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
  var GHAuth = new GithubAuth();

  GHAuth.init();
  Editors.init();

  // Github auth stuff
  document.getElementById('commit').onclick = function () {
    if(GHAuth.isSigned()) {
      // instaedit.addGithubJS(function () {
        console.log(Editors.getEditor());
        var token = GHAuth.loadTokenFromCookies();
        var url = instaedit.getContentSourceUrl();
        var data = Editors.getEditor().contentEditor.getSession().getValue();

        instaedit.displayNotification('Preparing to commit to ' + token + ' with token ' + url, 'notification', document);
        instaedit.displayNotification('Preparing to commit to ' + token + ' with token ' + url, 'notification');

        GHAuth.sendCommitRequest(data, token, url, function (res) {
          if(res == 'success') {
            instaedit.displayNotification('Committed!', 'notification', document);
          } else {
            instaedit.displayNotification('Committing failed.', 'error', document);
          }
        });
/*
        instaedit.githubCommit(Editors.getEditor().contentEditor.getSession().getValue(), GHAuth.loadTokenFromCookies(), instaedit.getContentSourceUrl(), function (res) {
          if(res != 'err') {
            instaedit.displayNotification('Succesfully commited.', 'notification');
          } else {
            instaedit.displayNotification('Unkown error occurred during commit.', 'error');
          }
        });
*/
      // });
    } else {
      GHAuth.performProcess();
    }
  }
}