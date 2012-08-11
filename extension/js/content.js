function getElementsWithAttribute(name) {
  var spans = document.getElementsByTagName('span');

  elements = [];
  for(var i in spans) {
    if(typeof spans[i].getAttribute == 'function') {
      if(typeof spans[i].getAttribute('data-content-origin') != null) {
        elements.push(spans[i]);
      }
    }
  }
  return elements;
}

function fetchData(cb) {
  var data = {};
  var elements = getElementsWithAttribute('data-content-origin');
  
  for(var i in elements) {
  	data[elements[i].getAttribute('data-content-origin')] = elements[i].innerHTML;
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