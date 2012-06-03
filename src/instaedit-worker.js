function trim(string) {
	return string.replace(/^\s+||\s+$/g, '');
}

function importSiteContentFromScriptTag(dataScriptTag, head) {
	var content = 'not found';

	if(head.length != 0) {
		for(var i in head) {
			if(trim(head[i]).replace(dataScriptTag, '') != trim(head[i])) {
				content = trim(head[i]).substr(dataScriptTag.length, trim(head[i]).length - dataScriptTag.length)
			}
		}
	}

	return trim(content);
}

function importSiteContentFromMetaTag(metaTag, head) {
	var url = '';
	var content = 'data import failed';

	if(head.length != 0) {
		for(var i in head) {
			if(trim(head[i]).replace(metaTag, '') != trim(head[i])) {
				url = trim(head[i]).substr(metaTag.length, trim(head[i]).length - metaTag.length)
				url = url.replace('">', '');
			}
		}
	}

	// TODO - Solve same origin policy issues
	var request = new XMLHttpRequest();  
	request.open('GET', url, true);  
	request.send();  
  
	if(request.status === "200") {  
  		console.log(request.responseText);
  		content = request.responseText;
	}  

	return trim(content);
}

function importSiteContent(source) {
	var content = '';
	var head = document.getElementsByTagName('head');
	head = head[0].innerHTML.split('</script>');

	var dataScriptTag = '<script type="instaedit/rawdata">';
	var metaScriptTag = '<meta raw-data-source="';

	if(source == 'script-tag') {
		content = importSiteContentFromScriptTag(dataScriptTag, head)
	}

	if(source == 'meta-tag') {
		content = importSiteContentFromMetaTag(metaScriptTag, head);
	}

	if(source == 'auto') {
		var content = importSiteContentFromScriptTag(dataScriptTag, head)
		if(content == 'not found') {
			content = importSiteContentFromMetaTag(metaScriptTag, head);
		}
	}

	return content;
}

var siteContent = importSiteContent('script-tag');
var editorContent = 'This will be displayed in editor.';

if(document.location.href.replace('.com') != document.location.href) {
	editor = window.open('editor.html', 'Instaedit editor');
} else {
	editor = window.open('../src/editor.html', 'Instaedit editor');
}

editor.focus();