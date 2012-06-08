function toggleParserEditor() {
	var parserEditorWrapper = document.getElementById('parsereditor');
	var contentEditor = document.getElementById('editor');

	if(parserEditorWrapper.style.visibility == 'hidden') {
		parserEditorWrapper.style.visibility = 'visible';
		contentEditor.style.width = '50%';
		parserEditorWrapper.style.width = '50%';
		console.log('sjpw');
	} else {
		parserEditorWrapper.style.visibility = 'hidden'
		contentEditor.style.width = '100%';
		console.log('hode');
	}
}

window.onload = function() {
	var siteContent = window.opener.InstaeditWorker.siteContent;

	var editorContent = document.getElementById('editor');
	editorContent.innerHTML = siteContent.replace(/^\s+|\s+$/g,"");

	var editor = ace.edit("editor");
	var parsereditor = ace.edit("parsereditor");

	addEventListener('keydown', function () {
		window.opener.parse(editor.getSession().getValue());
	});

	var parserEditorWrapper = document.getElementById('parsereditor');
	parserEditorWrapper.style.visibility = 'hidden';

	var parserEditButton = document.getElementById('editparser');
	parserEditButton.onclick = function () {
		toggleParserEditor();
	}
}