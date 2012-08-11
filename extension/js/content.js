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
  	data[elements[i].getAttribute('data-origin')] = elements[i].innerHTML;
  }

  cb(data);
}

function getElementByScriptType(type) {
  var scripts = document.getElementsByTagName('script');
  for(var i in scripts) {
    if(scripts[i].getAttribute('type') == type) {
      return scripts[i];
    }
  }
  return scripts[i];
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  fetchData(function (data) {
  	data.contentScript = {};
  	data.contentScript.source = getElementByScriptType('instaedit/contentscript').getAttribute('src');
  	data.contentScript.code = document.getElementById('instaedit-parser-container').innerText;
    sendResponse(data);
  });
});