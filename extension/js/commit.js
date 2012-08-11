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

function setFileContent(code) {
  code = code + '<div class="ace_line" style="height:16px">';
  code = code + '</div>';
  code = code.split('\n').join('</div><div class="ace_line" style="height:16px">') 

  console.log('Setting code to - ' + code);
  console.log(code)
  var divs = document.getElementsByTagName('div');
  for (var i in divs) {
    console.log(divs[i])
    if(typeof divs[i] == 'object') {
      if(divs[i].getAttribute('class') == 'ace_layer ace_text-layer') {
        divs[i].innerHTML = code;
        console.log('done!!');
      }
    }
  }
}

function injectCommitData(code, message, url) {
  console.log('Injecting data');
  setCommitMessage(message);
  setFileContent(code);
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  console.log(request)
  var fileName = request.url.split('/')[request.url.split('/').length - 1];
  
  console.log(fileName)
  injectCommitData(request.code, 'Update of ' + fileName + ' created with instaedit.', request.url);
  sendResponse('Commited!');
});