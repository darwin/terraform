function trim(string) {
	return string.replace(/^\s+||\s+$/g, '');
}

function importSiteContent() {
	var head = document.getElementsByTagName('head');
	head = head[0].innerHTML.split('</script>');

	var dataScriptTag = '<script type="instaedit/rawdata">';
	console.log();

	if(head.length != 0) {
		for(var i in head) {
			if(trim(head[i]).replace(dataScriptTag, '') != trim(head[i])) {
				content = trim(head[i]).substr(dataScriptTag.length, trim(head[i]).length - dataScriptTag.length)
			}
		}
	}

	return trim(content);
}

var site_content = importSiteContent();
var editor_content = 'This will be displayed in editor.';

editor = window.open('../src/editor.html', 'Instaedit editor');
editor.focus();