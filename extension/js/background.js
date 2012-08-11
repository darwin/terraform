function getEditUrl(raw) {
  var url = raw.replace('404https://', '').replace('https://', '').replace('http://', '').replace('raw.github.com/', '').split('/');

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
  console.log(result);

  return 'https://github.com/' + result.username + '/' + result.repo + '/edit/' + result.branch + '/' + path;
}

function commitFiles(data) {
  var map = {};

  for(var i in data) {
    if(i != 'contentScript') {
      map[getEditUrl(i)] = i;
      chrome.tabs.create({
      	url: getEditUrl(i),
      	active: false
      }, function (tab) {
      	chrome.tabs.executeScript(tab.id, { file: "./js/commit.js" }, function() {
          console.log('Requesting edit of ');
          console.log(data);
          console.log(map[tab.url]);
          console.log(data[map[tab.url]]);
      		chrome.tabs.sendRequest(tab.id, {code: data[map[tab.url]], url: map[tab.url]}, function(result) {
          		console.log(result);
          });
      	});
      });
    }
  }
}

window.onload = function () {
  // document.getElementById('dump').innerHTML = '<img class="spinner" src="icon/spinner.gif">';

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

  document.getElementById('init').onclick = function () {
    chrome.tabs.getSelected(null, function (tab) { 
      chrome.tabs.executeScript(tab.id, { file: "./js/launch.js" }, function() {
        console.log('Done.');
      });
    });
  }
}