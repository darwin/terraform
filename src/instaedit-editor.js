window.onload = function() {
	var site_content = window.opener.site_content;

	var editor_content = document.getElementById('editor');
	editor_content.innerHTML = site_content.replace(/^\s+|\s+$/g,"");

	var editor = ace.edit("editor");

	window.opener.edited_content = 'New verision of the file submitted from editor.';
}