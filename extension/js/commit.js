// Divide data-injecting job between relevant functions
function injectCommitData(code, message, url) {
  setCommitMessage(message);
  setFileContent(code);
}

// Injects commit message to relevant form field in gh edit page
function setCommitMessage(message) {
  console.log('Setting commit message - ' + message);

  var inputs = document.getElementsByTagName('input');
  for (var i in inputs) {
    if(typeof inputs[i] == 'object') {
      if(inputs[i].getAttribute('class') == 'commit-message-summary') {
        inputs[i].setAttribute('value', message);
      }      
    }  
  }
}

// Injects content data to relevant form field in gh edit page
function setFileContent(code) {
  code = code + '<div class="ace_line" style="height:16px">';
  code = code + '</div>';
  code = code.split('\n').join('</div><div class="ace_line" style="height:16px">') 

  var divs = document.getElementsByTagName('div');
  for (var i in divs) {
    if(typeof divs[i] == 'object') {
      if(divs[i].getAttribute('class') == 'ace_layer ace_text-layer') {
        divs[i].innerHTML = code;
      }
    }
  }
}

// Handle whole exploit work
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  var fileName = request.url.split('/')[request.url.split('/').length - 1];
  injectCommitData(request.code, 'Update of ' + fileName + ' created with instaedit.', request.url);

  sendResponse('Commited!');
});