function getEditUrl(raw) {
  var url = raw.replace('https://', '').replace('http://', '').replace('raw.github.com/', '').split('/');

  var result = {
    username: url[0],
    repo: url[1],
    branch: url[2]
  }

  path = url.join('/');
  for(var i in result) {
  	path = path.replace(result[i], '');
  }

  while(path[0] == '/') {
  	path = path.substr(1);
  }

  result.path = path;

  return 'https://github.com/' + result.username + '/' + result.repo + '/edit/' + result.branch + '/' + path;
}

function commitFiles(data) {
  document.getElementById('dump').innerHTML = data.contentScript.source;

  for(var i in data) {
    if(i != 'contentScript') {
      chrome.tabs.create({
      	url: getEditUrl(i),
      	active: false
      }, function (tab) {
      	console.log(tab)
      });
    }
  }
}

window.onload = function () {
  document.getElementById('dump').innerHTML = '<img class="spinner" src="icon/spinner.gif">';
  document.getElementById('button').onclick = function () {
    chrome.tabs.getSelected(null, function (tab) { 
	  var tabId = tab.id; 
	  chrome.tabs.executeScript(tabId, { file: "./js/content.js" }, function() {
	    chrome.tabs.sendRequest(tabId, {}, function(data) {
	      commitFiles(data);
        });
	  });
    });
  }
}