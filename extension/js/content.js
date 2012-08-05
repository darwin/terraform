function getElementsWithAttribute(name) {
  var body = document.getElementsByTagName('body');
  var body = body[0];
  var elements = new Array();

  for(var i in body.childNodes) {
    if(body.childNodes[i].nodeType == 1) {
      if(body.childNodes[i].getAttribute(name) != null) {
        elements.push(body.childNodes[i]);
      }
    }
  }

  return elements;
}

function fetchData(cb) {
  var data = {};
  var elements = getElementsWithAttribute('data-origin');

  for(var i in elements) {
  	data[getMetaContent('instaedit-repo') + elements[i].getAttribute('data-origin')] = elements[i].innerHTML;
  }

  cb(data);
}

function getMetaContent(name) {
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

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  fetchData(function (data) {
  	data.contentScript = {};
  	data.contentScript.source = getMetaContent('instaedit-parser');
  	data.contentScript.code = document.getElementById('instaedit-parser-container').innerText;
    sendResponse(data);
  });
});