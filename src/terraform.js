// create a default config if not provided
if (typeof TerraformConfig == "undefined") {
  var TerraformConfig = {
    defScope: this, // scope where we define terraform object
    evalScope: this, // target scope where we eval parser code
    logScope: this // scope where we expect console.log for editor logging
  };
}

// make our stuff private, the only exported variable will be terraform into TerraformConfig.defScope
(function(config) {
  var editor;

  var addScript = function (url, cb) {
    var th = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.onload = function () {
      cb();
    };
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', url);
    th.appendChild(s);
  }

  var addJQuery = function (cb) {
    if (typeof jQuery != 'undefined') {
       console.log('jQuery already present.');
       cb();
    } else {
        addScript('https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function () {
          cb();
        });
    }
  }

  var openEditor = function() {
    console.log('Opening editor.');
    var editor = window.open('../src/editor/editor.html', "_blank", "resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=900, top=10, left=10");
    editor.terraform = terraform;
    editor.focus();
  }

  var evalCode = function(code) {
    var tempVarName = "__instaedit_gen_"+Math.floor(Math.random()*5000);
    var prefix = "(function(content){";
    var postfix = "})("+tempVarName+")";
    var code = prefix + code + postfix;

    // eval in wrapper function using global temporary variable
    // TODO: alternatively we could encode site content into postfix as a parameter string
    config.evalScope[tempVarName] = getSiteContent();
    try {
      config.evalScope.eval(code);
    } catch (ex) {
      if (editor && editor.onError) {
        editor.onError(ex);
      }
    }
    delete config.evalScope[tempVarName];
  }

  var fetchExternals = function(cb) {
    cb();
  };

  var bootstrap = function (cb) {
    addJQuery(function() {
      fetchExternals(function() {
        cb();
      });
    });
  }

  var logger = function() {
    if (!config.logScope) {
      return;
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift('Terraform:');
    config.logScope.console.log.apply(config.logScope.console, args);
  }

  var editPage = function() {
    openEditor();
  }

  // define public interface
  var terraform = {
    bootstrap: bootstrap,
    logger: logger,
    evalCode: evalCode,
    edit: editPage
  };

  // export public interface into selected scope
  if (config.defScope) {
    config.defScope.terraform = terraform;
  }

  // perform intial editor bootstraping, this enables user to call it later by hand via terraform.bootstrap() if needed
  if (!config.preventBootstrapping) {
    bootstrap(function () {
    });
  }
})(TerraformConfig);