function getMetaContent (name) {
  var content = 404;
  var metas = document.getElementsByTagName('meta');

  for(var i in metas) {
    var meta = metas[i];
    if(meta.name == name) {
      content = meta.content;
    }    
  }

  return content;
}

var head = document.getElementsByTagName('head')[0];

// Create script pointing to current instaedit
var scr = document.createElement('script');
scr.setAttribute('type', 'text/javascript');
scr.setAttribute('src', 'https://raw.github.com/binaryage/instaedit/master/src/instaedit.js');
head.appendChild(scr);


// Recognize if site is instaeditable
scr.onload = function () {
	console.log('Getting meta content' + getMetaContent('instaedit-repo'));
	if(getMetaContent('instaedit-repo') == 404) {
		window.location = 'http://instaedit.binaryage.com';
	}
}