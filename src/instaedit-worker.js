var Worker = function () {};

Worker.siteContent = '';
Worker.editorContent = '';

Worker.prototype.trim = function trim(string) {
	return string.replace(/^\s+||\s+$/g, '');
}

Worker.prototype.importSiteContentFromScriptTag = function (dataScriptTag, head) {
	var content = 'not found';

	if(head.length != 0) {
		for(var i in head) {
			if(this.trim(head[i]).replace(dataScriptTag, '') != this.trim(head[i])) {
				content = this.trim(head[i]).substr(dataScriptTag.length, this.trim(head[i]).length - dataScriptTag.length)
			}
		}
	}

	return this.trim(content);
}

Worker.prototype.importSiteContentFromMetaTag = function (metaTag, head) {
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

Worker.prototype.importSiteContent = function (source) {
	var content = '';
	var head = document.getElementsByTagName('head');
	head = head[0].innerHTML.split('</script>');

	var dataScriptTag = '<script type="instaedit/rawdata">';
	var metaScriptTag = '<meta raw-data-source="';

	if(source == 'script-tag') {
		content = this.importSiteContentFromScriptTag(dataScriptTag, head)
	}

	if(source == 'meta-tag') {
		content = this.importSiteContentFromMetaTag(metaScriptTag, head);
	}

	if(source == 'auto') {
		var content = this.importSiteContentFromScriptTag(dataScriptTag, head)
		if(content == 'not found') {
			content = this.importSiteContentFromMetaTag(metaScriptTag, head);
		}
	}

	return content;
}

Worker.prototype.getSiteContent = function () {
	if(this.siteContent == '') {
		this.siteContent = this.importSiteContent('script-tag')
	}

	return this.siteContent;
}

Worker.prototype.performEditor = function () {
	if(document.location.href.replace('.com') != document.location.href) {
		editor = window.open('editor.html', 'Instaedit editor');
	} else {
		editor = window.open('../src/editor.html', 'Instaedit editor');
	}
}

Worker.prototype.load = function () {
	this.siteContent = this.getSiteContent();
	this.performEditor();

	editor.focus();
}

// TODO fix it
var InstaeditWorker = new Worker();
InstaeditWorker.load();