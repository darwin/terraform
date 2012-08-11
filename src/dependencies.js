var DependenciesManager = function () {};

DependenciesManager.dependencies = new Array();

DependenciesManager.prototype.getDependenciesList = function () {
  return this.dependencies;
}

DependenciesManager.prototype.addDependency = function (name) {
  console.log(name);
  // this.dependencies.push(name);
}

DependenciesManager.prototype.isLoaded = function (name) {
  var deps = this.getDependenciesList();
  var found = false;

  if(deps.length != 0) {
    for(var i in deps) {
      if(deps[i] == name) {
        found = true;
        break;
      }
    }    
  }

  return found;
}

DependenciesManager.prototype.provide = function (name, cb) {
  var self = this;
  var th = document.getElementsByTagName('head')[0];

  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');

  var location = (window.location + '');
  if(location.split('instaedit.local').length == 1) {
    console.log('Identified foreign use - warm welcome, new user! Data will be load from gh automatically.')
    s.setAttribute('src', name.replace('../', 'https://raw.github.com/binaryage/instaedit/master/'));
  } else {
    console.log('Identified localhost.');
    console.log(location);
    console.log(location.split('local'));
    console.log(location.split('local').length);

    s.setAttribute('src', name);
  }

  s.onload = function () {
    console.log('Script ' + name + ' loaded.');
    self.addDependency(name);
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