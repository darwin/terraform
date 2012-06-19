function toggleParserEditor() {
	console.log('toggling');
	var parserEditorWrapper = document.getElementById('parsereditor');
	var contentEditor = document.getElementById('editor');
	var applyButton = document.getElementById('apply');

	if(parserEditorWrapper.style.visibility == 'hidden') {
		console.log('up');
		parserEditorWrapper.style.visibility = 'visible';
		applyButton.style.visibility = 'visible';

		contentEditor.style.height = '360px';
	} else {
		console.log('down');
		parserEditorWrapper.style.visibility = 'hidden';
		applyButton.style.visibility = 'hidden';

		contentEditor.style.height = '695px';
	}
}

function handleError(err) {
	console.log('error ocured' + err)
	var errorWindow = document.getElementById('error-info');
	errorWindow.innerHTML = '<div class="error">' + err + '</div>';
	errorWindow.style.visibility = 'visible';
}

window.opener.onerror = function (err) {
	handleError(err);
}

window.onerror = function (err) {
	handleError(err);
}

window.onload = function() {
	var siteContent = window.opener.InstaeditWorker.siteContent;
	var parserScript = window.opener.parserCode;

	var editorContent = document.getElementById('editor');
	editorContent.innerHTML = siteContent.replace(/^\s+|\s+$/g,"");

	var parserEditorElem = document.getElementById('parsereditor');
	parserEditorElem.innerHTML = parserScript.replace(/^\s+|\s+$/g,"");

	var applyButton = document.getElementById('apply');
	applyButton.style.visibility = 'hidden';

	var editor = ace.edit("editor");
	var parsereditor = ace.edit("parsereditor");
	window.opener.parserCode = parsereditor.getSession().getValue();

	// var JavaScriptMode = require("ace/mode/javascript").Mode;
    // parsereditor.getSession().setMode(new JavaScriptMode());

	applyButton.onclick = function () {
		if(window.opener.parserCode != parsereditor.getSession().getValue()) {
			window.opener.parserCode = parsereditor.getSession().getValue();
			window.opener.eval(window.opener.parserCode);
		}
	}

	addEventListener('keyup', function () {
		window.opener.instadata = editor.getSession().getValue();
		window.opener.eval(window.opener.parserCode);
	});

	var parserEditorWrapper = document.getElementById('parsereditor');
	parserEditorWrapper.style.visibility = 'hidden';

	var parserEditButton = document.getElementById('editparser');
	parserEditButton.onclick = function () {
		toggleParserEditor();
		editor.resize();
		parsereditor.resize();
	}

	var parserEditButton = document.getElementById('commit');
	parserEditButton.onclick = function () {
		alert('Feature not yet supported but you can manually paste that to your site: ' + '\n' + '\n' + editor.getSession().getValue());
	}
}