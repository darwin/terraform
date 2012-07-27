chrome.tabs.getSelected(null, function (tab) {
  console.log(tab);
});

chrome.tabs.getSelected(null, function(tab) {
  chrome.tabs.sendRequest(tab.id, {action: "getFiles"}, function(response) {
    console.log(response);
  });
});

window.onload = function () {
	// console.log(chrome.extension.getBackgroundPage().instaedit);
	var button = document.getElementById('button');
	var result = document.getElementById('result');

	button.onclick = function () {
		result.innerHTML = 'Commited!';
	};
}