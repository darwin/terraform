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

  var reqData = JSON.stringify(reqDataRaw);
/*
  var request = new XMLHttpRequest();
  request.open('POST', this.getAuthServerURL() + '/commit', true);
  request.setRequestHeader("Content-Type", "application/json");
  
  request.send(reqData);

*/

/*
  $.ajax({
    type: 'POST',
    url: this.getAuthServerURL() + '/commit',
    data: reqData,
    success: cb('success'),
    dataType: cb('failed')
  });
*/

  console.log('Sending data to ' + this.getAuthServerURL() + '/commit');
  $.post(this.getAuthServerURL() + '/commit', reqData,
    function(data) {
      console.log('API retrieved ');
      console.log(data);
      cb('failed'); // Just for debugging of course
    }, 
    "json"
  );
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
