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

DependenciesManager.prototype.provide = function (name) {
  var self = this;
  var th = document.getElementsByTagName('head')[0];

  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', name);

  s.onload = function () {
    console.log('Script ' + name + ' loaded.');
    self.addDependency(name);
    // cb();
  }

  th.appendChild(s);
}

DependenciesManager.prototype.provideWhenScriptsLoaded.provide = function (name) {
  var self = this;

  console.log('Script ' + name + ' will be loaded when every script will be loaded.');
  window.addEventListener('DOMContentLoaded', function () {
    console.log('Loading ' + name);
    self.provide(name);
  }, false);
}

var Deps = new DependenciesManager();