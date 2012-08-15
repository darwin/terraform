// Transforms 'raw.github.com' links to github.com/:username/:repo/edit/:branch/:path
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

  return 'https://github.com/' + result.username + '/' + result.repo + '/edit/' + result.branch + '/' + path;
}

// Transform content data to gh edit links, open it, inject data there and let user click "Commit"
function commitFiles(data) {
  var map = {};

  for(var i in data) {
    if(i != 'contentScript') {
      map[getEditUrl(i)] = i;
      chrome.tabs.create({
      	url: getEditUrl(i),
      	active: false
      }, function (tab) {
        // Inject data to opened edit-link
      	chrome.tabs.executeScript(tab.id, { file: "./js/commit.js" }, function() {
      		chrome.tabs.sendRequest(tab.id, {code: data[map[tab.url]], url: map[tab.url]}, function(result) {
          		console.log(result);
          });
      	});
      });
    }
  }
}

window.onload = function () {
  // Launch DOM content miner
  document.getElementById('button').onclick = function () {
    chrome.tabs.getSelected(null, function (tab) { 
	    chrome.tabs.executeScript(tab.id, { file: "./js/content.js" }, function() {
	      chrome.tabs.sendRequest(tab.id, {}, function(data) {
          // Open edit links and inject data to them 
	        commitFiles(data);
        });
	    });
    });
  }

  // Inject instaedit
  document.getElementById('launch').onclick = function () {
    chrome.tabs.getSelected(null, function (tab) { 
      chrome.tabs.executeScript(tab.id, { file: "./js/launch.js" }, function() {
        console.log('Instaedit launched from extension.');
      });
    });
  }
}