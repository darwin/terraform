function getElementByScriptType(type) {
  var scripts = document.getElementsByTagName('script');
  for(var i in scripts) {
    if(scripts[i].getAttribute('type') == type) {
      return scripts[i];
    }
  }
  return scripts[i];
}

var head = document.getElementsByTagName('head')[0];

// Create script pointing to current instaedit
var scr = document.createElement('script');
scr.setAttribute('type', 'text/javascript');
scr.setAttribute('src', 'https://raw.github.com/binaryage/instaedit/master/src/instaedit.js');
head.appendChild(scr);

// Redirect to docs when error occured.
window.onerror = function (err) {
  console.log('error occurred', err, err.stack);
  window.open('http://instaedit.binaryage.com', '_blank');
  window.focus();
}