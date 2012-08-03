// document.getElementById('dump').innerHTML = '<img src="icon/spinner.gif">';

function commitFiles(data) {
  document.getElementById('dump').innerHTML = data.repo;
  console.log(data);
}

chrome.tabs.getSelected(null, function (tab) { 
  var tabId = tab.id 
  console.log('Executing')
  chrome.tabs.executeScript(tabId, { file: "./js/content.js" }, function() {
    chrome.tabs.sendRequest(tabId, {}, function(results) {
      commitFiles(results);
    });
  });
});