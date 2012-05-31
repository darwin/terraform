function trim(string) {
	return string.replace(/^\s+||\s+$/g, '');
}

function import_site_content_from_script_tag(data_script_tag, head) {
	var content = 'not found';

	if(head.length != 0) {
		for(var i in head) {
			if(trim(head[i]).replace(data_script_tag, '') != trim(head[i])) {
				content = trim(head[i]).substr(data_script_tag.length, trim(head[i]).length - data_script_tag.length)
			}
		}
	}

	return trim(content);
}

function import_site_content_from_meta_tag(meta_tag, head) {
	var url = '';
	var content = 'data import failed';

	if(head.length != 0) {
		for(var i in head) {
			if(trim(head[i]).replace(meta_tag, '') != trim(head[i])) {
				url = trim(head[i]).substr(meta_tag.length, trim(head[i]).length - meta_tag.length)
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

	var data_script_tag = '<script type="instaedit/rawdata">';
	var meta_script_tag = '<meta raw-data-source="';

	if(source == 'script-tag') {
		content = import_site_content_from_script_tag(data_script_tag, head);
	}

	if(source == 'meta-tag') {
		content = import_site_content_from_meta_tag(meta_script_tag, head);
	}

	if(source == 'auto') {
		var content = import_site_content_from_script_tag(data_script_tag, head);
		if(content == 'not found') {
			content = import_site_content_from_meta_tag(data_script_tag, head);
		}
	}

	return content;
}

var site_content = importSiteContent('meta-tag');
var editor_content = 'This will be displayed in editor.';

editor = window.open('../src/editor.html', 'Instaedit editor');
editor.focus();