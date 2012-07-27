chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    var file = {};
    file.parser = instaedit.getParserCode();
    file.content = instaedit.getSiteContent();
    file.url = instaedit.getContentSourceUrl();

    var fileList = new Array();
    fileList.push(file);

    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    console.log(request.action);
    if(request.action == "getFiles") {
      console.log({files: fileList});
      sendResponse({files: fileList});
    }
  }
);