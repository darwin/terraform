(function () {
  function done(res) {
    var result = document.getElementById('parser-compiler-result');
    result.innerHTML = res;

    var time = document.getElementById('parser-compiler-time');
    time.innerHTML = microtime(true) - elapsedTime;
  }

  var elapsedTime = microtime(true);

  var Editors = new EditorsManager();

  // Demo parser
  instaedit.fetchParserCode('https://raw.github.com/binaryage/instaedit/master/demo/js/parser-example.js', function (code) {
  	console.log(code);
    var result = Editors.compileParser(code, '/_posts/2012-04-07-hello-san-francisco.mds', 'index.html');

    done('Succeeded');
  });
}(document));