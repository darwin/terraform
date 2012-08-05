function getMetaContent(name) {
  var content = 404;

  var metas = document.getElementsByTagName('meta');
  for(var i in metas) {
    var meta = metas[i];
    if(meta.name == name) {
      content = meta.content;
    }    
  }

  return content;
}

function getCommitables() {
  var data = {};

  console.log(getMetaContent('instaedit-repo'));
  data.repo = getMetaContent('instaedit-repo');
  // data.contents = window['instaedit314159265'].getDataContents();

  return data;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  sendResponse(getCommitables());
});