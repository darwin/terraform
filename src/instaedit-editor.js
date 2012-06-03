window.onload = function() {
	var siteContent = window.opener.siteContent;

	var editorContent = document.getElementById('editor');
	editorContent.innerHTML = siteContent.replace(/^\s+|\s+$/g,"");

	var editor = ace.edit("editor");

	addEventListener('keydown', function () {
		window.opener.parse(editor.getSession().getValue());
	});
}