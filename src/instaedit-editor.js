window.onload = function() {
	var site_content = window.opener.site_content;

	var editor_content = document.getElementById('editor');
	editor_content.innerHTML = site_content.replace(/^\s+|\s+$/g,"");

	var editor = ace.edit("editor");

	addEventListener('keydown', function () {
		console.log(editor.getSession().getValue());
		window.opener.parse(editor.getSession().getValue());
		// window.opener.document.getElementById('instaeditable').innerHTML = editor.getSession().getValue();
	});
}