function getCommitables() {
  var data = {};
  data.repo = /*instaedit.getMetaContent('instaedit-repo');*/'repo name!';
  data.contents = /*instaedit.getDataContents();*/ {};
  return data;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  sendResponse(getCommitables());
});