// Inject script-tag pointing to current instaedit
var head = document.getElementsByTagName('head')[0];
var scr = document.createElement('script');

scr.setAttribute('type', 'text/javascript');
scr.setAttribute('src', 'https://raw.github.com/binaryage/instaedit/master/src/instaedit.js');

head.appendChild(scr);

// Redirect to documentation if error occured
window.onerror = function (err) {
  console.log('error occurred', err, err.stack);
  window.open('http://instaedit.binaryage.com', '_blank');
  window.focus();
}