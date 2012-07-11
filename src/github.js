var GithubAuth = function () {};

GithubAuth.signed = false;

GithubAuth.prototype.getCookieName = function () {
  return 'gh-token';
}

GithubAuth.prototype.isSigned = function ()  {
  return this.signed;
}

GithubAuth.prototype.setIsSigned = function (val)  {
  this.signed = val;
}

GithubAuth.prototype.getAuthServerURL = function () {
  return 'http://instaedit-server.herokuapp.com';
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
      } else {
        console.log('Not logged yet.');
      }
    }
  }
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
