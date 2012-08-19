var DependenciesManager = function () {};

DependenciesManager.prototype.provide = function (name, cb) {
  var self = this;
  var th = document.getElementsByTagName('head')[0];

  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');

  var location = (window.location + '');
  if(location.split('instaedit.local').length == 1) {
    console.log('Files are not available - DependenciesManager will be load them from gh automatically.')
    s.setAttribute('src', name.replace('../', 'https://raw.github.com/binaryage/instaedit/master/'));
  } else {
    console.log('Files are available.');
    s.setAttribute('src', name);
  }

  s.onload = function () {
    console.log('Script ' + name + ' loaded.');
    cb();
  }

  th.appendChild(s);
}

DependenciesManager.prototype.provideWhenScriptsLoaded = function (name) {
  var self = this;

  console.log('Script ' + name + ' will be loaded when every script will be loaded.');
  window.addEventListener('DOMContentLoaded', function () {
    console.log('Loading ' + name);
    self.provide(name);
  }, false);
}

var Deps = new DependenciesManager();