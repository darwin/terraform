var GithubAuth = function () {};

GithubAuth.signed = false;

GithubAuth.prototype.getCookieName = function () {
  return 'gh-token*1';
}

GithubAuth.prototype.isSigned = function ()  {
  return this.signed;
}

GithubAuth.prototype.setIsSigned = function (val)  {
  this.signed = val;
}

GithubAuth.prototype.getAuthServerURL = function () {
  // Stabile version
  // return 'http://instaedit-server.herokuapp.com';

  // Dev version
  return 'http://floating-light-7013.herokuapp.com';
}

GithubAuth.prototype.storeTokenToCookies = function(token) {
  now = new Date();
  expires = new Date(now.getYear(), now.getMonth() + 1, 1);
  console.log('Storing token ' + token + ' which will expire in ' + expires);

  var expires = new Date();
  expires.setDate(expires.getDate() + expires);
  var token = escape(token) + ((expires == null) ? "" : "; expires=" + expires.toUTCString());
  document.cookie = this.getCookieName() + "=" + token;
}

GithubAuth.prototype.loadTokenFromCookies = function() {
  console.log('Looking for cookie ' + this.getCookieName());
  var i, x, y, ARRcookies = document.cookie.split(";");

  for(i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x = x.replace(/^\s+|\s+$/g,"");
    if(x == this.getCookieName()) {
        return unescape(y);
    }
  }
}

GithubAuth.prototype.checkIfSignedToGithub = function () {
  if(!instaedit.signedToGithub) {
    var self = this;
    var request = new XMLHttpRequest();

    request.open('GET', this.getAuthServerURL() + '/getCode', true);
    request.send();

    request.onloadend = function () {
      console.log(request.responseText);
      var response = JSON.parse(request.responseText);

      console.log(response);
      if(response.result == 'found') {
        var token = response.token;
        console.log(token);

        self.setGithubToken(token);
        self.setIsSigned(true);
        document.getElementById('commit').innerHTML = 'Commit';
      } else {
        console.log('Not logged yet.');
      }
    }
  }
}

GithubAuth.prototype.sendCommitRequest = function (data, code, url, cb) {
  var reqDataRaw = {};
  reqDataRaw.data = data;
  reqDataRaw.token = code;
  reqDataRaw.target = url;

  console.log('Sending data to ' + this.getAuthServerURL() + '/commit');
  
  var self = this;
  var reqUrl = 'https://api.github.com/repos/' + url.split('/')[3] + '/' + url.split('/')[4] + '/git/refs/heads/' + url.split('/')[5];
  jQuery.getJSON(reqUrl + "?callback=?", {}, function(tree) {
    var reqUrl = 'https://api.github.com/repos/' + url.split('/')[3] + '/' + url.split('/')[4] + '/branches';
    
    jQuery.getJSON(reqUrl + "?callback=?", {}, function(commits) {
      for(var i in commits.data) {
        console.log(commits.data[i].name);
        console.log(url.split('/')[5]);
        if(commits.data[i].name == url.split('/')[5]) {
          var parent = commits.data[i].commit.sha;
        }
      }

      reqDataRaw.tree = tree.data.object.sha;
      reqDataRaw.parents = new Array();
      reqDataRaw.parents.push(parent);
      var reqData = JSON.stringify(reqDataRaw);
      console.log(reqData);

      var request = new XMLHttpRequest();
      request.open('POST', self.getAuthServerURL() + '/commit', true);
      request.setRequestHeader("Content-Type", "application/json");
  
      request.send(reqData);

      request.onloadend = function () {
        console.log(request.statusCode);
        if(request.status == 500) {
          cb('failed');
        } else {
          cb('success');
        }
      }
    });
  });
}

GithubAuth.prototype.setGithubToken = function (token) {
  console.log('Received auth data.');

  this.storeTokenToCookies(token);
  instaedit.signedToGithub = true;
  instaedit.displayNotification('Succesfully logged to github with token ' + token, 'notification');
  instaedit.githubToken = token;
  document.getElementById('commit').innerHTML = 'Commit';
}

GithubAuth.prototype.init = function () {
  console.log(this.loadTokenFromCookies());
  console.log(typeof this.loadTokenFromCookies());

  if(typeof this.loadTokenFromCookies() == 'undefined') {
    document.getElementById('commit').innerHTML = 'Github login';
    instaedit.signedToGithub = false;
  } else {
    this.setIsSigned(true);
    instaedit.signedToGithub = true;
    instaedit.githubToken = this.loadTokenFromCookies();
  }
}

GithubAuth.prototype.performProcess = function () {
  window.open(this.getAuthServerURL() + '/login/', 'Instaedit github auth','width=600, height=500');
  setInterval(this.checkIfSignedToGithub(), 3000);
}
