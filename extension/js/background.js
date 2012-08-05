function commitFiles(data) {
  document.getElementById('dump').innerHTML = data.contentScript.source;
  console.log(data);
}

window.onload = function () {
  document.getElementById('dump').innerHTML = '<img class="spinner" src="icon/spinner.gif">';
  document.getElementById('button').onclick = function () {
    chrome.tabs.getSelected(null, function (tab) { 
	  var tabId = tab.id 
	  console.log('Executing')
	  chrome.tabs.executeScript(tabId, { file: "./js/content.js" }, function() {
	    chrome.tabs.sendRequest(tabId, {}, function(data) {
	      commitFiles(data);
        });
	  });
    });
  }
}