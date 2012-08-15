// Fetch all instaedit "data containers"
function fetchData(cb) {
  var data = {};
  var elements = getElementsWithAttribute('data-content-origin');
  
  for(var i in elements) {
    data[elements[i].getAttribute('data-content-origin')] = elements[i].innerHTML;
  }

  cb(data);
}

// Get alld spans, divs and sections elements with specifig attribute
function getElementsWithAttribute(name) {
  var elems = ['span', 'div', 'section'];

  var elements = [];
  for(var i in elems) {
    elements = elements.concat(getElementWithAttribute(elems[i], name));
  }

  return elements;
}

// Get specific element with specifig attribute
function getElementWithAttribute(element, name) {
  var elems = document.getElementsByTagName(element);
  
  elements = [];
  for(var i in elems) {
    if(typeof elems[i].getAttribute == 'function') {
      if(elems[i].getAttribute(name) != null) {
        elements.push(elems[i]);
      }
    }
  }

  return elements;
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
    // Add content-script to rest of links
  	data[getElementByScriptType('instaedit/contentscript').getAttribute('src')] = document.getElementById('instaedit-parser-container').innerText;
    sendResponse(data);
  });
});