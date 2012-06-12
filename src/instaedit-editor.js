function toggleParserEditor() {
	var parserEditorWrapper = document.getElementById('parsereditor');
	var contentEditor = document.getElementById('editor');

	if(parserEditorWrapper.style.visibility == 'hidden') {
		parserEditorWrapper.style.visibility = 'visible';
		contentEditor.style.width = '50%';
		parserEditorWrapper.style.width = '50%';
	} else {
		parserEditorWrapper.style.visibility = 'hidden'
		contentEditor.style.width = '100%';
	}
}

window.onload = function() {
	var siteContent = window.opener.InstaeditWorker.siteContent;
	var parserScript = window.opener.parserCode;

	var editorContent = document.getElementById('editor');
	editorContent.innerHTML = siteContent.replace(/^\s+|\s+$/g,"");

	var parserEditorElem = document.getElementById('parsereditor');
	parserEditorElem.innerHTML = parserScript.replace(/^\s+|\s+$/g,"");


	var editor = ace.edit("editor");
	var parsereditor = ace.edit("parsereditor");

	addEventListener('keydown', function () {
		if(window.opener.parserCode != parsereditor.getSession().getValue()) {
			window.opener.parserCode = parsereditor.getSession().getValue();
		}

		window.opener.instadata = editor.getSession().getValue();
		window.opener.eval(window.opener.parserCode);
	});

	var parserEditorWrapper = document.getElementById('parsereditor');
	parserEditorWrapper.style.visibility = 'hidden';

	var parserEditButton = document.getElementById('editparser');
	parserEditButton.onclick = function () {
		toggleParserEditor();
	}

	var parserEditButton = document.getElementById('commit');
	parserEditButton.onclick = function () {
		alert('Feature not yet supported but you can manually paste that to your site: ' + '\n' + '\n' + editor.getSession().getValue());
	}
}