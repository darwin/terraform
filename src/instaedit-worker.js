var site_content = document.getElementById('instaeditable').innerHTML;
var editor_content = 'This will be displayed in editor.';

editor = window.open('../src/editor.html', 'Instaedit editor');
editor.focus();

console.log(site_content)

// Changes receiving here